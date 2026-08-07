import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect all chat routes
router.use(protect);

router.post('/new', ChatController.createConversation);
router.post('/ask', ChatController.askQuestion);
router.get('/history', ChatController.getHistory);
router.post('/regenerate', ChatController.regenerateAnswer);
router.post('/pin', ChatController.pinConversation);

router.get('/:conversationId', ChatController.getConversation);
router.put('/:conversationId', ChatController.updateConversation);
router.delete('/:conversationId', ChatController.deleteConversation);

export default router;
