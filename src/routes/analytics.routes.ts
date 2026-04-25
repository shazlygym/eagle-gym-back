import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, requireAdmin, analyticsController.getDashboard);
router.get('/revenue', authenticate, requireAdmin, analyticsController.getRevenue);
router.get('/new-members', authenticate, requireAdmin, analyticsController.getNewMembers);
router.get('/me', authenticate, analyticsController.getMyAnalytics);
router.get('/member/:userId', authenticate, requireAdmin, analyticsController.getMemberAnalytics);
router.post('/stats', authenticate, analyticsController.logStats);

export default router;
