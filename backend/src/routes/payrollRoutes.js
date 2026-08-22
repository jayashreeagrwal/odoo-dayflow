import express from 'express';
import {
  getMyPayroll,
  getAllPayroll,
  updateSalaryStructure,
} from '../controllers/payrollController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyPayroll);
router.get('/all', authorize('hr_admin'), getAllPayroll);
router.put('/:id', authorize('hr_admin'), updateSalaryStructure);

export default router;
