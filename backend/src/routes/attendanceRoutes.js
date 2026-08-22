import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance,
  markManualAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/my', getMyAttendance);

// HR Admin Routes
router.get('/all', authorize('hr_admin'), getAllAttendance);
router.post('/manual', authorize('hr_admin'), markManualAttendance);

export default router;
