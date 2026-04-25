import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, requireAdmin, paymentController.record);
router.get('/', authenticate, requireAdmin, paymentController.getAll);
router.get('/revenue', authenticate, requireAdmin, paymentController.getRevenue);
router.get('/export', authenticate, requireAdmin, paymentController.exportCsv);
router.get('/member/:userId', authenticate, requireAdmin, paymentController.getMemberPayments);

export default router;
