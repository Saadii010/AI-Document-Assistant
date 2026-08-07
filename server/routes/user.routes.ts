import { Router } from 'express';
import {
  updateProfile,
  changePassword,
  uploadAvatarImage,
  removeAvatarImage,
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadAvatar } from '../middleware/upload.middleware';
import {
  updateProfileSchema,
  changePasswordSchema,
  validateBody,
} from '../validators/auth.validator';

const router = Router();

router.put('/profile', protect, validateBody(updateProfileSchema), updateProfile);
router.put('/change-password', protect, validateBody(changePasswordSchema), changePassword);
router.post('/avatar', protect, uploadAvatar.single('avatar'), uploadAvatarImage);
router.delete('/avatar', protect, removeAvatarImage);

export default router;
