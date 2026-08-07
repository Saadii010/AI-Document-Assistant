export interface ISearchFilters {
  fileTypes?: string[];      // ['pdf', 'docx', 'txt']
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  dateFrom?: string;
  dateTo?: string;
  minSize?: number;
  maxSize?: number;
  status?: string;          // 'processing', 'processed', 'failed'
  documentIds?: string[];   // single or multiple documents
}

export interface ISearchResult {
  chunkId: string;
  documentId: string;
  documentName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  tags: string[];
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  pageNumber: number;
  paragraphNumber: number; // chunk index + 1
  score: number; // similarity or TF-IDF/regex score
  text: string;
}

export interface ISearchStats {
  totalSearches: number;
  avgResponseTimeMs: number;
  successRate: number; // % of searches returning >0 results
  zeroResultQueries: string[];
  popularTopics: { topic: string; count: number }[];
}
