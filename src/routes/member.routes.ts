import { Router } from 'express';
import { memberController } from '../controllers/member.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Admin routes
router.post('/', authenticate, requireAdmin, memberController.create);
router.get('/', authenticate, requireAdmin, memberController.getAll);
router.get('/me/profile', authenticate, memberController.getMyProfile);
router.get('/:id', authenticate, requireAdmin, memberController.getById);
router.put('/:id', authenticate, requireAdmin, memberController.update);
router.delete('/:id', authenticate, requireAdmin, memberController.delete);

export default router;
