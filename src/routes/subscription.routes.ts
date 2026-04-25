import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public (authenticated)
router.get('/', authenticate, subscriptionController.getAll);
router.get('/my', authenticate, subscriptionController.mySubscription);
router.get('/member/:userId/history', authenticate, requireAdmin, subscriptionController.memberSubscriptionHistory);

// Admin only
router.post('/', authenticate, requireAdmin, subscriptionController.create);
router.put('/:id', authenticate, requireAdmin, subscriptionController.update);
router.delete('/:id', authenticate, requireAdmin, subscriptionController.delete);
router.post('/assign', authenticate, requireAdmin, subscriptionController.assign);

export default router;
