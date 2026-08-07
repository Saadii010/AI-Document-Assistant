import { VectorStoreService } from './vectorStore.service';
import { EmbeddingService } from './embedding.service';
import { DocumentModel } from '../models/document.model';
import { DocumentChunkModel } from '../models/chunk.model';
import { ISearchFilters, ISearchResult } from './search.types';

export class SemanticSearchService {
  /**
   * Resolve MongoDB query to fetch document IDs matching the filters
   */
  static async getMatchingDocumentIds(userId: string, filters: ISearchFilters): Promise<string[] | null> {
    const query: any = { owner: userId };

    if (filters.documentIds && filters.documentIds.length > 0) {
      query._id = { $in: filters.documentIds };
    }

    if (filters.fileTypes && filters.fileTypes.length > 0) {
      query.fileType = { $in: filters.fileTypes };
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.isFavorite !== undefined) {
      query.isFavorite = filters.isFavorite;
    }

    if (filters.isArchived !== undefined) {
      query.isArchived = filters.isArchived;
    }

    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = 'processed'; // default to only processed documents for search
    }

    // Date range filters
    if (filters.dateFrom || filters.dateTo) {
      query.uploadDate = {};
      if (filters.dateFrom) query.uploadDate.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.uploadDate.$lte = new Date(filters.dateTo);
    }

    // Size filters
    if (filters.minSize !== undefined || filters.maxSize !== undefined) {
      query.fileSize = {};
      if (filters.minSize !== undefined) query.fileSize.$gte = filters.minSize;
      if (filters.maxSize !== undefined) query.fileSize.$lte = filters.maxSize;
    }

    // Check if any filter besides owner is applied
    const filterKeys = Object.keys(filters).filter(k => filters[k as keyof ISearchFilters] !== undefined);
    if (filterKeys.length === 0) {
      return null; // no filtering applied
    }

    const docs = await (DocumentModel as any).find(query, { _id: 1 }).lean();
    return docs.map((d: any) => d._id.toString());
  }

  /**
   * Search vector space for matches using embeddings and similarity
   */
  static async search(
    userId: string,
    queryText: string,
    filters: ISearchFilters = {},
    limit = 10
  ): Promise<ISearchResult[]> {
    if (!queryText.trim()) return [];

    // 1. Resolve metadata filters to matching document IDs
    const docIds = await this.getMatchingDocumentIds(userId, filters);
    
    // If filters were applied but no documents matched, return empty immediately
    const hasFilters = Object.keys(filters).some(k => filters[k as keyof ISearchFilters] !== undefined);
    if (hasFilters && docIds !== null && docIds.length === 0) {
      return [];
    }

    // 2. Generate embedding for search query
    const queryVector = await EmbeddingService.generateEmbedding(queryText);

    // 3. Perform similarity search in Vector Store
    const searchResults = await VectorStoreService.similaritySearch(
      queryVector,
      userId,
      limit * 2, // fetch slightly more to account for post-filtering or ranking adjustments
      docIds || undefined
    );

    if (searchResults.length === 0) {
      return [];
    }

    // 4. Enrich chunk records with full Document details
    const uniqueDocIds = Array.from(new Set(searchResults.map(r => r.documentId)));
    const docs = await (DocumentModel as any).find({ _id: { $in: uniqueDocIds } }).lean();
    const docMap = new Map<string, any>();
    for (const d of docs) {
      docMap.set(d._id.toString(), d);
    }

    const enriched: ISearchResult[] = [];
    for (const res of searchResults) {
      const doc = docMap.get(res.documentId);
      if (!doc) continue; // safety fallback

      enriched.push({
        chunkId: res.chunkId,
        documentId: res.documentId,
        documentName: doc.title,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadDate: doc.uploadDate,
        tags: doc.tags || [],
        category: doc.category || 'Notes',
        isFavorite: doc.isFavorite || false,
        isArchived: doc.isArchived || false,
        pageNumber: res.pageNumber || 1,
        paragraphNumber: (res.metadata?.index !== undefined ? res.metadata.index : 0) + 1,
        score: res.score,
        text: res.text,
      });
    }

    return enriched.slice(0, limit);
  }
}
export default SemanticSearchService;
