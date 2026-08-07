import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getOverview,
  getActivity,
  getStatistics,
  getCharts,
  getStorage,
  getProfileSummary,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  globalSearch,
  toggleDocFavorite,
  toggleChatFavorite,
} from '../controllers/dashboard.controller';

const router = Router();

// Secure all dashboard endpoints using high-security JWT protection
router.use(protect as any);

router.get('/overview', getOverview);
router.get('/activity', getActivity);
router.get('/statistics', getStatistics);
router.get('/charts', getCharts);
router.get('/storage', getStorage);
router.get('/profile-summary', getProfileSummary);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.post('/notifications/read-all', markAllNotificationsRead);
router.delete('/notifications/:id', deleteNotification);
router.get('/search', globalSearch);
router.patch('/documents/:id/favorite', toggleDocFavorite);
router.patch('/chats/:id/favorite', toggleChatFavorite);

export default router;
