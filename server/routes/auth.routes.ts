import { Router } from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateBody,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', logout);
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);
router.get('/me', protect, getMe);

export default router;
