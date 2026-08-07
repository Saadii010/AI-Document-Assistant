export interface ISearchFilters {
  fileTypes?: string[];
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  dateFrom?: string;
  dateTo?: string;
  minSize?: number;
  maxSize?: number;
  status?: string;
  documentIds?: string[];
}

export interface ISearchResult {
  chunkId: string;
  documentId: string;
  documentName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  tags: string[];
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  pageNumber: number;
  paragraphNumber: number;
  score: number;
  text: string;
}

export interface ISearchStats {
  totalSearches: number;
  avgResponseTimeMs: number;
  successRate: number;
  zeroResultQueries: string[];
  popularTopics: { topic: string; count: number }[];
}

export interface ISavedSearch {
  _id: string;
  name: string;
  query: string;
  filters: ISearchFilters;
  createdAt: string;
}

export interface ISearchContext {
  recentSearches: { query: string; lastSearchedAt: string }[];
  popularTags: string[];
  popularCategories: string[];
  recentDocuments: { id: string; title: string; fileType: string; uploadDate: string }[];
  suggestedQueries: string[];
}
