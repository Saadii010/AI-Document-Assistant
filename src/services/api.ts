export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  user?: any;
  token?: string;
  resetToken?: string;
  pagination?: any;
  errors?: Array<{ field: string; message: string }>;
}

const API_BASE_URL = '/api';

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  static clearToken() {
    localStorage.removeItem('auth_token');
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Default to JSON body if not multipart
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Automatically clear auth session if backend signals token expired
        if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
          this.clearToken();
          window.dispatchEvent(new Event('auth-session-expired'));
        }
        throw new Error(data.message || 'Something went wrong.');
      }

      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Network error, please check your connection.');
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  static async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  static async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
