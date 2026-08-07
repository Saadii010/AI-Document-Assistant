import { ISearchFilters, ISearchResult, ISearchStats, ISavedSearch, ISearchContext } from './types';

// Helper to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export class SearchApiClient {
  /**
   * Main search query
   */
  static async search(
    query: string,
    filters: ISearchFilters = {},
    limit = 10,
    searchType: 'semantic' | 'keyword' | 'hybrid' = 'hybrid'
  ): Promise<{ results: ISearchResult[]; stats: { responseTimeMs: number; count: number; searchType: string } }> {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, filters, limit, searchType }),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to execute search');
    }
    
    const body = await res.json();
    return body.data;
  }

  /**
   * Search history
   */
  static async getHistory(): Promise<any[]> {
    const res = await fetch('/api/search/history', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to fetch search history');
    const body = await res.json();
    return body.data;
  }

  static async clearHistory(query?: string): Promise<void> {
    const res = await fetch('/api/search/history', {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query }),
    });
    
    if (!res.ok) throw new Error('Failed to clear search history');
  }

  /**
   * Suggestions / Autocomplete
   */
  static async getSuggestions(q: string): Promise<string[]> {
    const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to fetch suggestions');
    const body = await res.json();
    return body.data;
  }

  /**
   * Popular and Initial context
   */
  static async getPopularContext(): Promise<ISearchContext> {
    const res = await fetch('/api/search/popular', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to fetch search context');
    const body = await res.json();
    return body.data;
  }

  /**
   * Analytics
   */
  static async getAnalytics(): Promise<ISearchStats> {
    const res = await fetch('/api/search/analytics', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to fetch search analytics');
    const body = await res.json();
    return body.data;
  }

  /**
   * Saved Searches
   */
  static async saveSearch(name: string, query: string, filters: ISearchFilters): Promise<ISavedSearch> {
    const res = await fetch('/api/search/saved', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, query, filters }),
    });
    
    if (!res.ok) throw new Error('Failed to save search query');
    const body = await res.json();
    return body.data;
  }

  static async getSavedSearches(): Promise<ISavedSearch[]> {
    const res = await fetch('/api/search/saved', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to fetch saved searches');
    const body = await res.json();
    return body.data;
  }

  static async deleteSavedSearch(id: string): Promise<void> {
    const res = await fetch(`/api/search/saved/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to delete saved search');
  }
}
