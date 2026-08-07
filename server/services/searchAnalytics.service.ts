import { SearchAnalyticsModel } from '../models/searchAnalytics.model';
import { SearchHistoryModel } from '../models/searchHistory.model';
import { ISearchStats } from './search.types';

export class SearchAnalyticsService {
  /**
   * Log search query execution and update/create search history in background
   */
  static async logSearch(options: {
    userId: string;
    query: string;
    searchType: 'semantic' | 'keyword' | 'hybrid';
    responseTimeMs: number;
    resultsCount: number;
    filters?: any;
  }): Promise<void> {
    const { userId, query, searchType, responseTimeMs, resultsCount, filters } = options;
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    try {
      // 1. Create a permanent analytics log entry
      await (SearchAnalyticsModel as any).create({
        userId,
        query: trimmedQuery,
        searchType,
        responseTimeMs,
        hasResults: resultsCount > 0,
        resultsCount,
      });

      // 2. Upsert search history with search frequencies and timestamps
      await (SearchHistoryModel as any).findOneAndUpdate(
        { userId, query: trimmedQuery },
        {
          $inc: { searchCount: 1 },
          $set: {
            resultsCount,
            filters: filters || {},
            lastSearchedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Error logging search analytics:', err);
    }
  }

  /**
   * Retrieves aggregated search statistics for the authenticated user
   */
  static async getUserStats(userId: string): Promise<ISearchStats> {
    try {
      const logs = await (SearchAnalyticsModel as any).find({ userId }).lean();
      
      const totalSearches = logs.length;
      if (totalSearches === 0) {
        return {
          totalSearches: 0,
          avgResponseTimeMs: 0,
          successRate: 100,
          zeroResultQueries: [],
          popularTopics: [],
        };
      }

      // Calculate Average Response Time
      const totalTime = logs.reduce((sum: number, log: any) => sum + (log.responseTimeMs || 0), 0);
      const avgResponseTimeMs = Math.round(totalTime / totalSearches);

      // Calculate Success Rate
      const successfulSearches = logs.filter((log: any) => log.hasResults).length;
      const successRate = Math.round((successfulSearches / totalSearches) * 100);

      // Extract Zero-Result Queries
      const zeroResultQueries = Array.from(
        new Set<string>(
          logs.filter((log: any) => !log.hasResults).map((log: any) => log.query)
        )
      ).slice(0, 5);

      // Extract Popular Topics (Count frequencies of searches)
      const frequencyMap = new Map<string, number>();
      logs.forEach((log: any) => {
        const q = log.query.toLowerCase().trim();
        frequencyMap.set(q, (frequencyMap.get(q) || 0) + 1);
      });

      const popularTopics = Array.from(frequencyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic, count]) => ({
          topic,
          count,
        }));

      return {
        totalSearches,
        avgResponseTimeMs,
        successRate,
        zeroResultQueries,
        popularTopics,
      };
    } catch (err) {
      console.error('Error calculating user search stats:', err);
      return {
        totalSearches: 0,
        avgResponseTimeMs: 0,
        successRate: 100,
        zeroResultQueries: [],
        popularTopics: [],
      };
    }
  }

  /**
   * Clears the user's search history
   */
  static async clearHistory(userId: string): Promise<void> {
    await (SearchHistoryModel as any).deleteMany({ userId });
  }

  /**
   * Deletes a single query from user's search history
   */
  static async deleteHistoryItem(userId: string, query: string): Promise<void> {
    await (SearchHistoryModel as any).deleteOne({ userId, query });
  }
}
export default SearchAnalyticsService;
