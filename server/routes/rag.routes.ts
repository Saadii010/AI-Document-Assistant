import { Router } from 'express';
import { RagController } from '../controllers/rag.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect all RAG pipeline endpoints
router.use(protect);

router.post('/process/:documentId', RagController.processDocument);
router.post('/reprocess/:documentId', RagController.reprocessDocument);
router.get('/status/:documentId', RagController.getStatus);
router.get('/logs/:documentId', RagController.getLogs);
router.get('/chunks/:documentId', RagController.getChunks);
router.delete('/embeddings/:documentId', RagController.deleteEmbeddings);

export default router;
