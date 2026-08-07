import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { logger } from '../utils/logger';

// @desc    Get dashboard overview stats & listings
// @route   GET /api/dashboard/overview
export async function getOverview(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const overview = await DashboardService.getOverview(userId);
    res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (err: any) {
    logger.error('Error fetching dashboard overview: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while fetching overview data.',
    });
  }
}

// @desc    Get recent user activities log
// @route   GET /api/dashboard/activity
export async function getActivity(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const activities = await DashboardService.getActivities(userId);
    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (err: any) {
    logger.error('Error fetching dashboard activity log: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while fetching activity log.',
    });
  }
}

// @desc    Get stats summary (Total documents, chats, AI requests, storage limit)
// @route   GET /api/dashboard/statistics
export async function getStatistics(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const overview = await DashboardService.getOverview(userId);
    res.status(200).json({
      success: true,
      data: overview.stats,
    });
  } catch (err: any) {
    logger.error('Error fetching dashboard statistics: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while fetching statistics.',
    });
  }
}

// @desc    Get historical monthly chart and pie chart breakdowns
// @route   GET /api/dashboard/charts
export async function getCharts(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const chartsData = await DashboardService.getChartsData(userId);
    res.status(200).json({
      success: true,
      data: chartsData,
    });
  } catch (err: any) {
    logger.error('Error fetching dashboard charts: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while fetching charts data.',
    });
  }
}

// @desc    Get account storage usage node details
// @route   GET /api/dashboard/storage
export async function getStorage(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const overview = await DashboardService.getOverview(userId);
    res.status(200).json({
      success: true,
      data: {
        storageUsed: overview.stats.storageUsed,
        storageLimit: overview.stats.storageLimit,
        percentage: ((overview.stats.storageUsed / overview.stats.storageLimit) * 100).toFixed(1),
      },
    });
  } catch (err: any) {
    logger.error('Error fetching storage metrics: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while fetching storage details.',
    });
  }
}

// @desc    Get user profile summary data
// @route   GET /api/dashboard/profile-summary
export async function getProfileSummary(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user; // populated by authenticate JWT middleware
    const overview = await DashboardService.getOverview(user.id);
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin || new Date().toISOString(),
        totalDocuments: overview.stats.totalDocuments,
        totalChats: overview.stats.totalChats,
      },
    });
  } catch (err: any) {
    logger.error('Error fetching profile summary: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while fetching profile summary.',
    });
  }
}

// @desc    Get notifications
// @route   GET /api/dashboard/notifications
export async function getNotifications(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const notifications = await DashboardService.getNotifications(userId);
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err: any) {
    logger.error('Error fetching notifications: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while fetching notifications.',
    });
  }
}

// @desc    Mark notification as read
// @route   PATCH /api/dashboard/notifications/:id/read
export async function markNotificationRead(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    const notif = await DashboardService.markNotificationAsRead(userId, notificationId);
    if (!notif) {
      res.status(404).json({
        success: false,
        message: 'Notification not found or access denied.',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notif,
    });
  } catch (err: any) {
    logger.error('Error reading notification: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while updating notification.',
    });
  }
}

// @desc    Mark all notifications as read
// @route   POST /api/dashboard/notifications/read-all
export async function markAllNotificationsRead(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    await DashboardService.markAllNotificationsAsRead(userId);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err: any) {
    logger.error('Error marking all notifications as read: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
    });
  }
}

// @desc    Delete notification
// @route   DELETE /api/dashboard/notifications/:id
export async function deleteNotification(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    const success = await DashboardService.deleteNotification(userId, notificationId);
    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Notification not found or access denied.',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.',
    });
  } catch (err: any) {
    logger.error('Error deleting notification: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while deleting notification.',
    });
  }
}

// @desc    Global dashboard search
// @route   GET /api/dashboard/search
export async function globalSearch(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const query = req.query.q || '';
    const results = await DashboardService.globalSearch(userId, query as string);
    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    logger.error('Error performing global search: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while performing search.',
    });
  }
}

// @desc    Toggle document favorite status
// @route   PATCH /api/dashboard/documents/:id/favorite
export async function toggleDocFavorite(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const docId = req.params.id;
    const doc = await DashboardService.toggleDocumentFavorite(userId, docId);
    if (!doc) {
      res.status(404).json({
        success: false,
        message: 'Document not found or access denied.',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: doc.favorite ? 'Added to favorites.' : 'Removed from favorites.',
      data: doc,
    });
  } catch (err: any) {
    logger.error('Error toggling document favorite: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while toggling favorite.',
    });
  }
}

// @desc    Toggle chat favorite status
// @route   PATCH /api/dashboard/chats/:id/favorite
export async function toggleChatFavorite(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;
    const chat = await DashboardService.toggleChatFavorite(userId, chatId);
    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found or access denied.',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: chat.favorite ? 'Chat added to favorites.' : 'Chat removed from favorites.',
      data: chat,
    });
  } catch (err: any) {
    logger.error('Error toggling chat favorite: %O', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while toggling favorite.',
    });
  }
}
