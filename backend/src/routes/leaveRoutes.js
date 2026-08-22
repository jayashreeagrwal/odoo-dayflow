import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.get('/all', authorize('hr_admin'), getAllLeaves);
router.put('/:id/status', authorize('hr_admin'), updateLeaveStatus);

export default router;
