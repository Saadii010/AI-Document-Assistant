import { ISearchResult } from './search.types';

export class RankingService {
  /**
   * Intelligently merges and ranks semantic search results and keyword search results.
   * Uses weighted scoring and de-duplication.
   */
  static rank(
    semanticResults: ISearchResult[],
    keywordResults: ISearchResult[],
    semanticWeight = 0.7,
    keywordWeight = 0.3
  ): ISearchResult[] {
    const mergedMap = new Map<string, { result: ISearchResult; semScore?: number; keyScore?: number }>();

    // Process semantic matches
    semanticResults.forEach((res) => {
      mergedMap.set(res.chunkId, {
        result: res,
        semScore: res.score,
      });
    });

    // Process keyword matches
    keywordResults.forEach((res) => {
      const existing = mergedMap.get(res.chunkId);
      if (existing) {
        existing.keyScore = res.score;
      } else {
        mergedMap.set(res.chunkId, {
          result: res,
          keyScore: res.score,
        });
      }
    });

    const ranked: ISearchResult[] = [];

    mergedMap.forEach((entry, chunkId) => {
      let finalScore = 0;

      if (entry.semScore !== undefined && entry.keyScore !== undefined) {
        // Result is in both lists -> highest relevance boost
        finalScore = semanticWeight * entry.semScore + keywordWeight * entry.keyScore;
        // Apply correlation bonus
        finalScore = Math.min(finalScore + 0.1, 1.0);
      } else if (entry.semScore !== undefined) {
        // Only semantic
        finalScore = semanticWeight * entry.semScore;
      } else if (entry.keyScore !== undefined) {
        // Only keyword
        finalScore = keywordWeight * entry.keyScore;
      }

      ranked.push({
        ...entry.result,
        score: Number(finalScore.toFixed(4)),
      });
    });

    // Sort descending by calculated hybrid score
    return ranked.sort((a, b) => b.score - a.score);
  }
}
export default RankingService;
