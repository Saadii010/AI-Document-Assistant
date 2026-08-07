import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect all search routes
router.use(protect);

router.post('/', SearchController.search);
router.post('/semantic', SearchController.searchSemantic);
router.post('/hybrid', SearchController.searchHybrid);
router.get('/history', SearchController.getHistory);
router.delete('/history', SearchController.clearHistory);
router.get('/suggestions', SearchController.getSuggestions);
router.get('/popular', SearchController.getPopularContext);
router.get('/analytics', SearchController.getAnalytics);

router.post('/saved', SearchController.saveSearch);
router.get('/saved', SearchController.getSavedSearches);
router.delete('/saved/:id', SearchController.deleteSavedSearch);

export default router;
