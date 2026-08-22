import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  updateSelfProfile,
  updateEmployeeByAdmin,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

// Routes
router.get('/', authorize('hr_admin'), getAllEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id/profile', updateSelfProfile);
router.put('/:id/admin', authorize('hr_admin'), updateEmployeeByAdmin);
router.delete('/:id', authorize('hr_admin'), deleteEmployee);

export default router;
