import { SemanticSearchService } from './semanticSearch.service';
import { KeywordSearchService } from './keywordSearch.service';
import { RankingService } from './ranking.service';
import { ISearchFilters, ISearchResult } from './search.types';

export class HybridSearchService {
  /**
   * Performs hybrid search combining semantic vector search and keyword regex matching.
   */
  static async search(
    userId: string,
    queryText: string,
    filters: ISearchFilters = {},
    limit = 10
  ): Promise<ISearchResult[]> {
    if (!queryText.trim()) return [];

    // Run both searches in parallel for low latency
    const [semanticResults, keywordResults] = await Promise.all([
      SemanticSearchService.search(userId, queryText, filters, limit * 1.5).catch(() => []),
      KeywordSearchService.search(userId, queryText, filters, limit * 1.5).catch(() => []),
    ]);

    // Rank and merge them intelligently
    const rankedResults = RankingService.rank(semanticResults, keywordResults);

    // Slice to desired limit
    return rankedResults.slice(0, limit);
  }
}
export default HybridSearchService;
