import { DocumentChunkModel } from '../models/chunk.model';
import { DocumentModel } from '../models/document.model';
import { ISearchFilters, ISearchResult } from './search.types';

export class KeywordSearchService {
  /**
   * Search knowledge base using keyword text matching and filters
   */
  static async search(
    userId: string,
    queryText: string,
    filters: ISearchFilters = {},
    limit = 10
  ): Promise<ISearchResult[]> {
    if (!queryText.trim()) return [];

    const escapedQuery = queryText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    // 1. Build Document filter query
    const docQuery: any = { owner: userId };

    if (filters.documentIds && filters.documentIds.length > 0) {
      docQuery._id = { $in: filters.documentIds };
    }

    if (filters.fileTypes && filters.fileTypes.length > 0) {
      docQuery.fileType = { $in: filters.fileTypes };
    }

    if (filters.category) {
      docQuery.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      docQuery.tags = { $in: filters.tags };
    }

    if (filters.isFavorite !== undefined) {
      docQuery.isFavorite = filters.isFavorite;
    }

    if (filters.isArchived !== undefined) {
      docQuery.isArchived = filters.isArchived;
    }

    if (filters.status) {
      docQuery.status = filters.status;
    } else {
      docQuery.status = 'processed';
    }

    if (filters.dateFrom || filters.dateTo) {
      docQuery.uploadDate = {};
      if (filters.dateFrom) docQuery.uploadDate.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) docQuery.uploadDate.$lte = new Date(filters.dateTo);
    }

    if (filters.minSize !== undefined || filters.maxSize !== undefined) {
      docQuery.fileSize = {};
      if (filters.minSize !== undefined) docQuery.fileSize.$gte = filters.minSize;
      if (filters.maxSize !== undefined) docQuery.fileSize.$lte = filters.maxSize;
    }

    // First fetch all eligible document IDs and maps to enrich chunks fast
    const matchingDocs = await (DocumentModel as any).find(docQuery).lean();
    if (matchingDocs.length === 0) {
      return [];
    }

    const docIds = matchingDocs.map((d: any) => d._id.toString());
    const docMap = new Map<string, any>();
    for (const d of matchingDocs) {
      docMap.set(d._id.toString(), d);
    }

    // 2. Query Document Chunks for keyword matching
    const chunkQuery: any = {
      owner: userId,
      document: { $in: docIds },
      text: { $regex: regex },
    };

    const matchingChunks = await (DocumentChunkModel as any).find(chunkQuery)
      .limit(limit * 2)
      .lean();

    const results: ISearchResult[] = [];

    // Map matched chunks to search results
    for (const chunk of matchingChunks) {
      const doc = docMap.get(chunk.document.toString());
      if (!doc) continue;

      // Calculate simple frequency/match score for ordering
      const occurrenceCount = (chunk.text.match(regex) || []).length;
      const wordCount = chunk.wordCount || 1;
      // score between 0.1 and 1.0 representing keyword density
      const rawDensity = occurrenceCount / wordCount;
      const score = Math.min(0.1 + rawDensity * 5, 0.95);

      results.push({
        chunkId: chunk.chunkId,
        documentId: chunk.document.toString(),
        documentName: doc.title,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadDate: doc.uploadDate,
        tags: doc.tags || [],
        category: doc.category || 'Notes',
        isFavorite: doc.isFavorite || false,
        isArchived: doc.isArchived || false,
        pageNumber: chunk.pageNumber || 1,
        paragraphNumber: chunk.index + 1,
        score,
        text: chunk.text,
      });
    }

    // 3. Also support Document Title / Description keyword matches directly
    // If a document title matches but its chunks weren't retrieved, fetch the first chunk of that document
    const titleRegex = new RegExp(escapedQuery, 'i');
    for (const doc of matchingDocs) {
      if (titleRegex.test(doc.title) || (doc.description && titleRegex.test(doc.description))) {
        const alreadyIncluded = results.some(r => r.documentId === doc._id.toString());
        if (!alreadyIncluded) {
          // Fetch the first chunk of this document
          const firstChunk = await (DocumentChunkModel as any).findOne({ document: doc._id }).lean();
          if (firstChunk) {
            results.push({
              chunkId: firstChunk.chunkId,
              documentId: doc._id.toString(),
              documentName: doc.title,
              fileType: doc.fileType,
              fileSize: doc.fileSize,
              uploadDate: doc.uploadDate,
              tags: doc.tags || [],
              category: doc.category || 'Notes',
              isFavorite: doc.isFavorite || false,
              isArchived: doc.isArchived || false,
              pageNumber: firstChunk.pageNumber || 1,
              paragraphNumber: firstChunk.index + 1,
              score: 0.99, // very high score for direct title match
              text: firstChunk.text,
            });
          }
        }
      }
    }

    // Sort by descending score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }
}
export default KeywordSearchService;
