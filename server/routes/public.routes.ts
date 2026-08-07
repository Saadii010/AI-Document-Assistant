import { Router } from 'express';
import {
  submitContact,
  subscribeNewsletter,
  getFeatures,
  getPricingPlans,
  getTestimonials,
  getFaq,
} from '../controllers/public.controller';

const router = Router();

// Contact Message Route
router.post('/contact', submitContact);

// Newsletter Subscriber Route
router.post('/newsletter', subscribeNewsletter);

// Public Info Routes
router.get('/public/features', getFeatures);
router.get('/public/pricing', getPricingPlans);
router.get('/public/testimonials', getTestimonials);
router.get('/public/faq', getFaq);

export default router;
