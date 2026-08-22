import express from 'express';
import {
  register,
  login,
  getMe,
  inviteEmployee,
  acceptInvitation,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { authRateLimit } from '../middleware/authRateLimit.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', authRateLimit({ max: 10 }), login);
router.post('/invite', protect, authorize('hr_admin'), inviteEmployee);
router.post('/accept-invitation', authRateLimit({ max: 10 }), acceptInvitation);
router.post('/forgot-password', authRateLimit({ max: 5 }), forgotPassword);
router.post('/reset-password', authRateLimit({ max: 5 }), resetPassword);
router.get('/me', protect, getMe);

export default router;
