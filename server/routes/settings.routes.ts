import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  changePassword,
  getSessions,
  deleteSession,
  deleteSessions,
  exportSettings,
  importSettings,
  deleteChats,
  deleteDocuments,
  deleteAccount,
} from '../controllers/settings.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Secure all endpoints with protect middleware
router.use(protect);

router.get('/', getSettings);
router.put('/', updateSettings);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.put('/password', changePassword);

router.get('/sessions', getSessions);
router.delete('/sessions/:id', deleteSession);
router.delete('/sessions', deleteSessions);

router.post('/export', exportSettings);
router.post('/import', importSettings);

router.delete('/chats', deleteChats);
router.delete('/documents', deleteDocuments);
router.delete('/account', deleteAccount);

export default router;
