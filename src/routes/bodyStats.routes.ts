import { Router } from 'express';
import { bodyStatController } from '../controllers/bodyStats.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, bodyStatController.logStat);
router.get('/me', authenticate, bodyStatController.getMyStats);
router.get('/me/latest', authenticate, bodyStatController.getLatest);
router.delete('/:id', authenticate, bodyStatController.deleteStat);

// Admin
router.get('/member/:userId', authenticate, requireAdmin, bodyStatController.getMemberStats);

export default router;
