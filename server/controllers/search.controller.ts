import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { SemanticSearchService } from '../services/semanticSearch.service';
import { KeywordSearchService } from '../services/keywordSearch.service';
import { HybridSearchService } from '../services/hybridSearch.service';
import { SuggestionService } from '../services/suggestion.service';
import { SearchAnalyticsService } from '../services/searchAnalytics.service';
import { SearchHistoryModel } from '../models/searchHistory.model';
import { SavedSearchesModel } from '../models/savedSearches.model';
import { logger } from '../utils/logger';

export class SearchController {
  /**
   * POST /api/search
   * Generic unified search (defaults to Hybrid Search, can override with body.searchType)
   */
  static async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    const startTime = Date.now();
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { query, filters = {}, limit = 10, searchType = 'hybrid' } = req.body;

      if (!query || !query.trim()) {
        res.status(400).json({ success: false, message: 'Search query is required' });
        return;
      }

      let results = [];
      const trimmedQuery = query.trim();

      if (searchType === 'semantic') {
        results = await SemanticSearchService.search(userId, trimmedQuery, filters, limit);
      } else if (searchType === 'keyword') {
        results = await KeywordSearchService.search(userId, trimmedQuery, filters, limit);
      } else {
        // Default is hybrid
        results = await HybridSearchService.search(userId, trimmedQuery, filters, limit);
      }

      const responseTimeMs = Date.now() - startTime;

      // Log analytics and history in the background asynchronously
      SearchAnalyticsService.logSearch({
        userId,
        query: trimmedQuery,
        searchType: searchType as any,
        responseTimeMs,
        resultsCount: results.length,
        filters,
      }).catch((err) => logger.error('Error logging search stats:', err));

      res.status(200).json({
        success: true,
        data: {
          results,
          stats: {
            responseTimeMs,
            count: results.length,
            searchType,
          },
        },
      });
    } catch (error: any) {
      logger.error('Error executing search:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server search error' });
    }
  }

  /**
   * POST /api/search/semantic
   * Dedicated Semantic Search
   */
  static async searchSemantic(req: AuthenticatedRequest, res: Response): Promise<void> {
    const startTime = Date.now();
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { query, filters = {}, limit = 10 } = req.body;

      if (!query || !query.trim()) {
        res.status(400).json({ success: false, message: 'Search query is required' });
        return;
      }

      const results = await SemanticSearchService.search(userId, query.trim(), filters, limit);
      const responseTimeMs = Date.now() - startTime;

      SearchAnalyticsService.logSearch({
        userId,
        query: query.trim(),
        searchType: 'semantic',
        responseTimeMs,
        resultsCount: results.length,
        filters,
      }).catch((err) => logger.error('Error logging semantic search stats:', err));

      res.status(200).json({
        success: true,
        data: {
          results,
          stats: {
            responseTimeMs,
            count: results.length,
            searchType: 'semantic',
          },
        },
      });
    } catch (error: any) {
      logger.error('Error in semantic search endpoint:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server search error' });
    }
  }

  /**
   * POST /api/search/hybrid
   * Dedicated Hybrid Search
   */
  static async searchHybrid(req: AuthenticatedRequest, res: Response): Promise<void> {
    const startTime = Date.now();
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { query, filters = {}, limit = 10 } = req.body;

      if (!query || !query.trim()) {
        res.status(400).json({ success: false, message: 'Search query is required' });
        return;
      }

      const results = await HybridSearchService.search(userId, query.trim(), filters, limit);
      const responseTimeMs = Date.now() - startTime;

      SearchAnalyticsService.logSearch({
        userId,
        query: query.trim(),
        searchType: 'hybrid',
        responseTimeMs,
        resultsCount: results.length,
        filters,
      }).catch((err) => logger.error('Error logging hybrid search stats:', err));

      res.status(200).json({
        success: true,
        data: {
          results,
          stats: {
            responseTimeMs,
            count: results.length,
            searchType: 'hybrid',
          },
        },
      });
    } catch (error: any) {
      logger.error('Error in hybrid search endpoint:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server search error' });
    }
  }

  /**
   * GET /api/search/history
   * Get search history for the user
   */
  static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const history = await (SearchHistoryModel as any).find({ userId })
        .sort({ lastSearchedAt: -1 })
        .limit(30)
        .lean();

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      logger.error('Error getting history:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * DELETE /api/search/history
   * Clear all history or delete specific history query
   */
  static async clearHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { query } = req.body;

      if (query && query.trim()) {
        await SearchAnalyticsService.deleteHistoryItem(userId, query.trim());
        res.status(200).json({ success: true, message: 'Search history item removed successfully' });
      } else {
        await SearchAnalyticsService.clearHistory(userId);
        res.status(200).json({ success: true, message: 'All search history cleared successfully' });
      }
    } catch (error: any) {
      logger.error('Error deleting history:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/search/suggestions
   * Autocomplete queries based on query parameter `q`
   */
  static async getSuggestions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const q = (req.query.q as string) || '';
      const suggestions = await SuggestionService.getSuggestions(userId, q);

      res.status(200).json({
        success: true,
        data: suggestions,
      });
    } catch (error: any) {
      logger.error('Error getting suggestions:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/search/popular
   * Get initial landing suggestions context (popular, recent, etc.)
   */
  static async getPopularContext(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const context = await SuggestionService.getInitialContext(userId);

      res.status(200).json({
        success: true,
        data: context,
      });
    } catch (error: any) {
      logger.error('Error getting popular context:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/search/analytics
   * Get total metrics for dashboard
   */
  static async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const stats = await SearchAnalyticsService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Error getting analytics stats:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/search/saved
   * Save a search configuration
   */
  static async saveSearch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { name, query, filters = {} } = req.body;
      if (!name || !name.trim() || !query || !query.trim()) {
        res.status(400).json({ success: false, message: 'Name and query are required' });
        return;
      }

      const saved = await (SavedSearchesModel as any).create({
        userId,
        name: name.trim(),
        query: query.trim(),
        filters,
      });

      res.status(201).json({
        success: true,
        data: saved,
      });
    } catch (error: any) {
      logger.error('Error saving search:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/search/saved
   * List saved search configurations
   */
  static async getSavedSearches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const saved = await (SavedSearchesModel as any).find({ userId }).sort({ createdAt: -1 }).lean();

      res.status(200).json({
        success: true,
        data: saved,
      });
    } catch (error: any) {
      logger.error('Error getting saved searches:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * DELETE /api/search/saved/:id
   * Delete a saved search
   */
  static async deleteSavedSearch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const result = await (SavedSearchesModel as any).findOneAndDelete({ _id: id, userId });
      
      if (!result) {
        res.status(404).json({ success: false, message: 'Saved search not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Saved search deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting saved search:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }
}
export default SearchController;
