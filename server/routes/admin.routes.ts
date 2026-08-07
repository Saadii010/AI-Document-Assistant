import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  getDashboard,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDocuments,
  getDocumentById,
  deleteDocument,
  reprocessDocument,
  getAnalytics,
  getStorage,
  getSystemHealth,
  getActivityLogs,
  getReports,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller';

const router = Router();

// Secure all admin routes with auth protect & admin check
router.use(protect);
router.use(authorize('admin'));

// Admin core Dashboard
router.get('/dashboard', getDashboard);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Document Management
router.get('/documents', getDocuments);
router.get('/documents/:id', getDocumentById);
router.delete('/documents/:id', deleteDocument);
router.post('/documents/:id/reprocess', reprocessDocument);

// Specialized administrative sections
router.get('/analytics', getAnalytics);
router.get('/storage', getStorage);
router.get('/system-health', getSystemHealth);
router.get('/activity-logs', getActivityLogs);
router.get('/reports', getReports);

// Application Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
