import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/document.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Configure memory storage for standard document processing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Authenticate all routes
router.use(protect);

// Upload endpoint
router.post('/upload', upload.single('file'), DocumentController.upload);

// General Query endpoints
router.get('/', DocumentController.getDocuments);
router.get('/search', DocumentController.getDocuments); // Search acts as a query variant
router.get('/recent', DocumentController.getRecent);
router.get('/storage', DocumentController.getStorage);

// Specific Document ID actions
router.get('/:id', DocumentController.getDocumentById);
router.put('/:id', DocumentController.updateDocument);
router.delete('/:id', DocumentController.deleteDocument);

// Status togglers
router.post('/:id/favorite', DocumentController.toggleFavorite);
router.post('/:id/archive', DocumentController.archiveDocument);
router.post('/:id/restore', DocumentController.restoreDocument);

// Content preview extractor
router.get('/:id/preview', DocumentController.getPreview);

export default router;
