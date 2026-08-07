import { ApiService, ApiResponse } from './api';

export interface DocumentResponse {
  id: string;
  title: string;
  originalFilename: string;
  storedFilename: string;
  fileType: 'pdf' | 'docx' | 'txt' | string;
  mimeType: string;
  fileSize: number;
  totalPages: number;
  owner: string;
  description: string;
  tags: string[];
  category: string;
  status: 'processing' | 'processed' | 'failed' | string;
  uploadDate: string;
  lastOpened: string | null;
  lastModified: string;
  isFavorite: boolean;
  isArchived: boolean;
  thumbnail: string | null;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsListResponse {
  documents: DocumentResponse[];
  total: number;
  page: number;
  pages: number;
}

export interface StorageStatsResponse {
  totalStorageUsed: number;
  maxStorage: number;
  remainingStorage: number;
  documentsCount: number;
  averageFileSize: number;
  largestFile: DocumentResponse | null;
}

export interface PreviewContentResponse {
  content: string;
}

export interface RagStatusResponse {
  documentId: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed' | 'retrying' | 'cancelled' | string;
  attempts: number;
  maxAttempts: number;
  errors: string[];
  updatedAt?: string;
}

export interface RagLogsResponse {
  logs: string[];
  startTime: string;
  endTime: string | null;
  duration: number;
  chunkCount: number;
  embeddingCount: number;
  retries: number;
  errors: string[];
}

export interface RagChunkItem {
  chunkId: string;
  text: string;
  pageNumber: number;
  charCount: number;
  wordCount: number;
  index: number;
}

export class DocumentApiService {
  // Enqueue document for RAG processing
  static async processDocument(documentId: string): Promise<ApiResponse<void>> {
    return ApiService.post<void>(`/rag/process/${documentId}`);
  }

  // Force reprocess document (cleanup old and start fresh RAG)
  static async reprocessDocument(documentId: string): Promise<ApiResponse<void>> {
    return ApiService.post<void>(`/rag/reprocess/${documentId}`);
  }

  // Get RAG pipeline status for document
  static async getRagStatus(documentId: string): Promise<ApiResponse<RagStatusResponse>> {
    return ApiService.get<RagStatusResponse>(`/rag/status/${documentId}`);
  }

  // Get RAG detailed logs
  static async getRagLogs(documentId: string): Promise<ApiResponse<RagLogsResponse>> {
    return ApiService.get<RagLogsResponse>(`/rag/logs/${documentId}`);
  }

  // Get RAG text chunks
  static async getRagChunks(documentId: string): Promise<ApiResponse<RagChunkItem[]>> {
    return ApiService.get<RagChunkItem[]>(`/rag/chunks/${documentId}`);
  }

  // Delete document embeddings and chunks
  static async deleteRagEmbeddings(documentId: string): Promise<ApiResponse<void>> {
    return ApiService.delete<void>(`/rag/embeddings/${documentId}`);
  }

  // Upload a document with meta fields
  static async uploadDocument(
    file: File,
    meta: { category?: string; description?: string; tags?: string[] } = {}
  ): Promise<ApiResponse<DocumentResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (meta.category) formData.append('category', meta.category);
    if (meta.description) formData.append('description', meta.description);
    if (meta.tags && meta.tags.length > 0) {
      formData.append('tags', JSON.stringify(meta.tags));
    }

    return ApiService.post<DocumentResponse>('/documents/upload', formData);
  }

  // Retrieve filtered, sorted, and paginated documents list
  static async getDocuments(params: {
    category?: string;
    fileType?: string;
    isFavorite?: boolean | string;
    isArchived?: boolean | string;
    tag?: string;
    search?: string;
    sort?: string;
    page?: number | string;
    limit?: number | string;
  } = {}): Promise<ApiResponse<DocumentsListResponse>> {
    const queryParts: string[] = [];
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        queryParts.push(`${key}=${encodeURIComponent(String(val))}`);
      }
    });
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return ApiService.get<DocumentsListResponse>(`/documents${queryString}`);
  }

  // Get a single document details by ID
  static async getDocumentById(id: string): Promise<ApiResponse<DocumentResponse>> {
    return ApiService.get<DocumentResponse>(`/documents/${id}`);
  }

  // Update title, description, category or tags of a document
  static async updateDocument(
    id: string,
    updates: {
      title?: string;
      description?: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<ApiResponse<DocumentResponse>> {
    return ApiService.put<DocumentResponse>(`/documents/${id}`, updates);
  }

  // Delete document physically from disk and database
  static async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return ApiService.delete<void>(`/documents/${id}`);
  }

  // Toggle favorite status
  static async toggleFavorite(id: string): Promise<ApiResponse<DocumentResponse>> {
    return ApiService.post<DocumentResponse>(`/documents/${id}/favorite`);
  }

  // Archive a document
  static async archiveDocument(id: string): Promise<ApiResponse<DocumentResponse>> {
    return ApiService.post<DocumentResponse>(`/documents/${id}/archive`);
  }

  // Restore a document from Archive
  static async restoreDocument(id: string): Promise<ApiResponse<DocumentResponse>> {
    return ApiService.post<DocumentResponse>(`/documents/${id}/restore`);
  }

  // Retrieve recently modified/opened documents
  static async getRecentDocuments(limit = 5): Promise<ApiResponse<DocumentResponse[]>> {
    return ApiService.get<DocumentResponse[]>(`/documents/recent?limit=${limit}`);
  }

  // Calculate storage metrics
  static async getStorageStats(): Promise<ApiResponse<StorageStatsResponse>> {
    return ApiService.get<StorageStatsResponse>('/documents/storage');
  }

  // Load preview content (parsed txt or summary)
  static async getDocumentPreview(id: string): Promise<ApiResponse<PreviewContentResponse>> {
    return ApiService.get<PreviewContentResponse>(`/documents/${id}/preview`);
  }
}
