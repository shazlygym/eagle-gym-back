import { Router } from 'express';
import { checkinController } from '../controllers/checkin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, checkinController.checkIn);
router.get('/me', authenticate, checkinController.getMyCheckins);
router.get('/', authenticate, requireAdmin, checkinController.getAllCheckins);
router.get('/qr/me', authenticate, checkinController.generateQR);
router.get('/qr/:userId', authenticate, requireAdmin, checkinController.generateQR);

export default router;
