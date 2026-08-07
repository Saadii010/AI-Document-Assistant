import { Router } from 'express';
import { ViewerController } from '../controllers/viewer.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Authenticate all viewer endpoints
router.use(protect);

// Main document loading for reading view
router.get('/document/:id', ViewerController.getDocument);

// Lazy-loaded page content (text/chunks)
router.get('/page/:documentId/:page', ViewerController.getPageContent);

// Citation source lookup endpoint (cross-page highlighting)
router.get('/citation/:chunkId', ViewerController.getCitation);

// History listing
router.get('/history', ViewerController.getHistory);

// Bookmarks
router.post('/bookmark', ViewerController.createBookmark);
router.put('/bookmark/:id', ViewerController.updateBookmark);
router.delete('/bookmark/:id', ViewerController.deleteBookmark);

// Notes / Annotations / Highlights
router.post('/note', ViewerController.createNote);
router.put('/note/:id', ViewerController.updateNote);
router.delete('/note/:id', ViewerController.deleteNote);

// User-specific Reader Settings
router.post('/settings', ViewerController.updateSettings);

// Reading progress updates (continuous position / progress logs)
router.post('/history/progress', ViewerController.updateReadingProgress);

export default router;
