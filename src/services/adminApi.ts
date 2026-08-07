import { ApiService, ApiResponse } from './api';

export interface IAdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalDocuments: number;
  documentsProcessed: number;
  pendingProcessing: number;
  failedProcessing: number;
  totalConversations: number;
  aiRequestsToday: number;
  totalTokensUsed: number;
  storageUsed: number;
  averageResponseTime: number;
}

export interface IAdminDashboardData {
  stats: IAdminDashboardStats;
  recentActivities: any[];
  recentAdminLogs: any[];
}

export interface ISystemHealthData {
  cpuUsage: number;
  memoryUsage: {
    total: number;
    free: number;
    used: number;
  };
  diskUsage: {
    total: number;
    free: number;
    used: number;
  };
  services: {
    mongodb: 'healthy' | 'unhealthy';
    faiss: 'healthy' | 'unhealthy';
    geminiApi: 'healthy' | 'unhealthy';
    backend: 'healthy' | 'unhealthy';
    frontend: 'healthy' | 'unhealthy';
  };
  queueLength: number;
}

export interface IAppSettingValues {
  appName: string;
  logoUrl?: string;
  storageLimitBytes: number;
  allowedFileTypes: string[];
  maxUploadSizeBytes: number;
  maintenanceMode: boolean;
  aiModelName: string;
  tokenLimitPerUserDay: number;
}

export class AdminApiService {
  static async getDashboard(): Promise<ApiResponse<IAdminDashboardData>> {
    return ApiService.get<IAdminDashboardData>('/admin/dashboard');
  }

  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return ApiService.get<any>(`/admin/users?${query}`);
  }

  static async getUserById(id: string): Promise<ApiResponse<any>> {
    return ApiService.get<any>(`/admin/users/${id}`);
  }

  static async updateUser(id: string, body: any): Promise<ApiResponse<any>> {
    return ApiService.put<any>(`/admin/users/${id}`, body);
  }

  static async deleteUser(id: string): Promise<ApiResponse<any>> {
    return ApiService.delete<any>(`/admin/users/${id}`);
  }

  static async getDocuments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    fileType?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return ApiService.get<any>(`/admin/documents?${query}`);
  }

  static async getDocumentById(id: string): Promise<ApiResponse<any>> {
    return ApiService.get<any>(`/admin/documents/${id}`);
  }

  static async deleteDocument(id: string): Promise<ApiResponse<any>> {
    return ApiService.delete<any>(`/admin/documents/${id}`);
  }

  static async reprocessDocument(id: string): Promise<ApiResponse<any>> {
    return ApiService.post<any>(`/admin/documents/${id}/reprocess`);
  }

  static async getAnalytics(): Promise<ApiResponse<any>> {
    return ApiService.get<any>('/admin/analytics');
  }

  static async getStorage(): Promise<ApiResponse<any>> {
    return ApiService.get<any>('/admin/storage');
  }

  static async getSystemHealth(): Promise<ApiResponse<ISystemHealthData>> {
    return ApiService.get<ISystemHealthData>('/admin/system-health');
  }

  static async getActivityLogs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return ApiService.get<any>(`/admin/activity-logs?${query}`);
  }

  static async getReports(type: string, format: string): Promise<ApiResponse<any>> {
    return ApiService.get<any>(`/admin/reports?type=${type}&format=${format}`);
  }

  static async getSettings(): Promise<ApiResponse<IAppSettingValues>> {
    return ApiService.get<IAppSettingValues>('/admin/settings');
  }

  static async updateSettings(body: IAppSettingValues): Promise<ApiResponse<IAppSettingValues>> {
    return ApiService.put<IAppSettingValues>('/admin/settings', body);
  }
}
