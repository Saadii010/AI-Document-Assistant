import { SearchHistoryModel } from '../models/searchHistory.model';
import { DocumentModel } from '../models/document.model';

export class SuggestionService {
  /**
   * Retrieves query suggestions based on partial input matching document titles and past searches
   */
  static async getSuggestions(userId: string, partialQuery: string): Promise<string[]> {
    if (!partialQuery || !partialQuery.trim()) {
      return [];
    }

    const trimmed = partialQuery.trim();
    const regex = new RegExp(trimmed.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');

    try {
      // 1. Fetch matching historical successful queries of this user
      const pastSearches = await (SearchHistoryModel as any).find({
        userId,
        query: { $regex: regex },
        resultsCount: { $gt: 0 },
      })
        .sort({ searchCount: -1 })
        .limit(4)
        .lean();

      // 2. Fetch matching document titles of this user
      const matchingDocs = await (DocumentModel as any).find({
        owner: userId,
        title: { $regex: regex },
        status: 'processed',
      })
        .limit(4)
        .lean();

      const suggestions = new Set<string>();

      pastSearches.forEach((s: any) => suggestions.add(s.query));
      matchingDocs.forEach((d: any) => {
        // Offer short, clean titles or standard questions based on title
        if (d.title.length < 40) {
          suggestions.add(d.title);
        } else {
          suggestions.add(d.title.substring(0, 37) + '...');
        }
      });

      // Simple generic suggested templates matching query if needed
      if (suggestions.size < 5) {
        suggestions.add(`Key insights on ${trimmed}`);
        suggestions.add(`Summary of ${trimmed}`);
      }

      return Array.from(suggestions).slice(0, 8);
    } catch (err) {
      return [`Key takeaways from ${trimmed}`, `Overview of ${trimmed}`];
    }
  }

  /**
   * Fetch context suggestions for initial search page load (recent, popular, suggested tags)
   */
  static async getInitialContext(userId: string) {
    try {
      // 1. Recent searches
      const recentSearches = await (SearchHistoryModel as any).find({ userId })
        .sort({ lastSearchedAt: -1 })
        .limit(5)
        .lean();

      // 2. Popular tags across user's documents
      const docs = await (DocumentModel as any).find({ owner: userId, status: 'processed' }).lean();
      const tagsMap = new Map<string, number>();
      const categoryMap = new Map<string, number>();

      docs.forEach((d: any) => {
        if (d.tags && Array.isArray(d.tags)) {
          d.tags.forEach((tag: string) => {
            if (tag.trim()) {
              tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
            }
          });
        }
        if (d.category) {
          categoryMap.set(d.category, (categoryMap.get(d.category) || 0) + 1);
        }
      });

      const popularTags = Array.from(tagsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([tag]) => tag);

      const popularCategories = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([cat]) => cat);

      // 3. Recent documents
      const recentDocs = await (DocumentModel as any).find({ owner: userId, status: 'processed' })
        .sort({ uploadDate: -1 })
        .limit(4)
        .lean();

      // 4. Default suggested queries
      const suggestedQueries = [
        'Analyze key objectives and deliverables',
        'Summarize recent study findings',
        'Explain financial projections and outcomes',
        'Identify important contract terms',
      ];

      return {
        recentSearches: recentSearches.map((s: any) => ({
          query: s.query,
          lastSearchedAt: s.lastSearchedAt,
        })),
        popularTags,
        popularCategories,
        recentDocuments: recentDocs.map((d: any) => ({
          id: d._id,
          title: d.title,
          fileType: d.fileType,
          uploadDate: d.uploadDate,
        })),
        suggestedQueries,
      };
    } catch (err) {
      return {
        recentSearches: [],
        popularTags: [],
        popularCategories: [],
        recentDocuments: [],
        suggestedQueries: [
          'List action items from documents',
          'Summarize research results',
        ],
      };
    }
  }
}
export default SuggestionService;
