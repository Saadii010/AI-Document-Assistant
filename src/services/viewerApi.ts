import { ApiService, ApiResponse } from './api';

export interface IDocument {
  id?: string;
  _id?: string;
  title: string;
  originalFilename: string;
  storedFilename: string;
  fileType: 'pdf' | 'docx' | 'txt' | string;
  mimeType: string;
  fileSize: number;
  totalPages: number;
  owner: string;
  description?: string;
  tags?: string[];
  category?: string;
  filePath: string;
  uploadDate: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBookmark {
  id?: string;
  _id?: string;
  userId: string;
  documentId: string;
  title: string;
  page: number;
  paragraphIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAnnotation {
  id?: string;
  _id?: string;
  userId: string;
  documentId: string;
  page: number;
  textSelection?: string;
  highlightColor?: string;
  comment?: string;
  isPrivate: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IReadingHistory {
  id?: string;
  _id?: string;
  userId: string;
  documentId: string | any;
  currentPage: number;
  progress: number;
  readingTimeSeconds: number;
  lastPosition?: string;
  lastViewedAt: string;
}

export interface IViewerSettings {
  zoomLevel: number;
  fitMode: 'width' | 'page' | 'none';
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  sidebarTab: string;
}

export interface IDocumentViewData {
  document: IDocument;
  bookmarks: IBookmark[];
  annotations: IAnnotation[];
  settings: IViewerSettings;
  history: IReadingHistory;
  textContent?: string;
}

export interface IPageContent {
  page: number;
  chunks: Array<{
    chunkId: string;
    document: string;
    text: string;
    pageNumber: number;
    charCount: number;
    wordCount: number;
    index: number;
  }>;
}

export interface ICitationInfo {
  chunkId: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  paragraphNumber: number;
  text: string;
  fileType: string;
  fileSize: number;
}

export class ViewerApiService {
  static async getDocument(id: string): Promise<ApiResponse<IDocumentViewData>> {
    return ApiService.get<IDocumentViewData>(`/viewer/document/${id}`);
  }

  static async getPageContent(documentId: string, page: number): Promise<ApiResponse<IPageContent>> {
    return ApiService.get<IPageContent>(`/viewer/page/${documentId}/${page}`);
  }

  static async getCitation(chunkId: string): Promise<ApiResponse<ICitationInfo>> {
    return ApiService.get<ICitationInfo>(`/viewer/citation/${chunkId}`);
  }

  static async getHistory(): Promise<ApiResponse<IReadingHistory[]>> {
    return ApiService.get<IReadingHistory[]>('/viewer/history');
  }

  static async createBookmark(data: {
    documentId: string;
    title: string;
    page: number;
    paragraphIndex?: number;
  }): Promise<ApiResponse<IBookmark>> {
    return ApiService.post<IBookmark>('/viewer/bookmark', data);
  }

  static async updateBookmark(id: string, data: {
    title: string;
    page: number;
    paragraphIndex?: number;
  }): Promise<ApiResponse<IBookmark>> {
    return ApiService.put<IBookmark>(`/viewer/bookmark/${id}`, data);
  }

  static async deleteBookmark(id: string): Promise<ApiResponse<void>> {
    return ApiService.delete<void>(`/viewer/bookmark/${id}`);
  }

  static async createNote(data: {
    documentId: string;
    page: number;
    textSelection?: string;
    highlightColor?: string;
    comment?: string;
    isPrivate?: boolean;
  }): Promise<ApiResponse<IAnnotation>> {
    return ApiService.post<IAnnotation>('/viewer/note', data);
  }

  static async updateNote(id: string, data: {
    textSelection?: string;
    highlightColor?: string;
    comment?: string;
    isPrivate?: boolean;
  }): Promise<ApiResponse<IAnnotation>> {
    return ApiService.put<IAnnotation>(`/viewer/note/${id}`, data);
  }

  static async deleteNote(id: string): Promise<ApiResponse<void>> {
    return ApiService.delete<void>(`/viewer/note/${id}`);
  }

  static async updateSettings(data: Partial<IViewerSettings>): Promise<ApiResponse<IViewerSettings>> {
    return ApiService.post<IViewerSettings>('/viewer/settings', data);
  }

  static async updateProgress(data: {
    documentId: string;
    currentPage: number;
    progress: number;
    readingTimeSeconds: number;
    lastPosition?: string;
  }): Promise<ApiResponse<IReadingHistory>> {
    return ApiService.post<IReadingHistory>('/viewer/history/progress', data);
  }
}
