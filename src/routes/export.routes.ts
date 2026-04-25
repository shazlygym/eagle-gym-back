import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Only admin can export data
router.use(authenticate, requireAdmin);

router.get('/members-csv', ExportController.exportMembers);
router.get('/payments-csv', ExportController.exportPayments);
router.get('/workouts-csv', ExportController.exportWorkouts);

export default router;
