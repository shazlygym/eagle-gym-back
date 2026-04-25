import { Router } from 'express';
import { workoutController } from '../controllers/workout.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Exercises
router.get('/exercises', authenticate, workoutController.getExercises);
router.post('/exercises', authenticate, requireAdmin, workoutController.createExercise);

// Member workout routes
router.get('/today', authenticate, workoutController.getTodayLog);
router.get('/history', authenticate, workoutController.getHistory);
router.get('/commitment', authenticate, workoutController.getCommitment);
router.get('/:id', authenticate, workoutController.getLogById);
router.put('/:logId', authenticate, workoutController.updateLog);

// Sets management
router.post('/:logId/sets', authenticate, workoutController.addSet);
router.put('/sets/:setId', authenticate, workoutController.updateSet);
router.delete('/sets/:setId', authenticate, workoutController.deleteSet);
router.patch('/:logId/complete', authenticate, workoutController.markComplete);

// Admin: manage member workout logs
router.get('/member/:userId/logs', authenticate, requireAdmin, workoutController.getMemberLogs);
router.post('/admin/assign-set', authenticate, requireAdmin, workoutController.adminAddSet);

// Program management
router.get('/member/:userId/program', authenticate, workoutController.getProgram);
router.post('/program', authenticate, requireAdmin, workoutController.addToProgram);
router.delete('/member/:userId/program/:exerciseId', authenticate, requireAdmin, workoutController.removeFromProgram);

export default router;
