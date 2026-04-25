import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { workoutService } from '../services/workout.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const addSetSchema = z.object({
  exerciseId: z.string(),
  setNumber: z.number().int().min(1).max(10),
  reps: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  targetReps: z.number().int().positive().optional(),
  targetWeight: z.number().min(0).optional(),
});

const adminAddSetSchema = addSetSchema.extend({
  userId: z.string(),
});

const addToProgramSchema = z.object({
  userId: z.string(),
  exerciseId: z.string(),
  dayName: z.string().optional().default('General'),
  setsCount: z.number().int().min(1).max(10),
});

const createExerciseSchema = z.object({
  name: z.string().min(2),
  muscleGroup: z.string().optional(),
  videoUrl: z.string().url().or(z.string().length(0)).optional(),
});

export const workoutController = {
  async getExercises(req: Request, res: Response, next: NextFunction) {
    try {
      const exercises = await workoutService.getAllExercises();
      sendSuccess(res, exercises, 'Exercises fetched');
    } catch (err) { next(err); }
  },

  async createExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createExerciseSchema.parse(req.body);
      const exercise = await workoutService.createExercise(data);
      sendSuccess(res, exercise, 'Exercise created', 201);
    } catch (err) { next(err); }
  },

  async getTodayLog(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { date } = req.query as { date?: string };
      const log = await workoutService.getTodayLog(req.user!.userId, date);
      sendSuccess(res, log, 'Workout log fetched');
    } catch (err) { next(err); }
  },

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt((req.query.limit as string) || '30', 10);
      const history = await workoutService.getUserHistory(req.user!.userId, limit);
      sendSuccess(res, history, 'Workout history fetched');
    } catch (err) { next(err); }
  },

  async getLogById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const log = await workoutService.getLogById(req.params.id, req.user!.userId);
      sendSuccess(res, log, 'Workout log fetched');
    } catch (err) { next(err); }
  },

  async addSet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addSetSchema.parse(req.body);
      const set = await workoutService.addSetToLog(req.params.logId, req.user!.userId, data);
      sendSuccess(res, set, 'Set added', 201);
    } catch (err) { next(err); }
  },

  async adminAddSet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, ...data } = adminAddSetSchema.parse(req.body);
      const log = await workoutService.getTodayLog(userId, req.query.date as string);
      if (!log) throw new Error('Workout log not found');
      const set = await workoutService.addSetToLog(log.id, userId, data);
      sendSuccess(res, set, 'Set added by admin', 201);
    } catch (err) { next(err); }
  },

  async updateSet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = z.object({
        reps: z.number().int().min(0).optional(),
        weight: z.number().min(0).optional(),
        targetReps: z.number().int().min(0).optional(),
        targetWeight: z.number().min(0).optional(),
      }).parse(req.body);
      const set = await workoutService.updateSet(req.params.setId, data);
      sendSuccess(res, set, 'Set updated');
    } catch (err) { next(err); }
  },

  async deleteSet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workoutService.deleteSet(req.params.setId);
      sendSuccess(res, null, 'Set deleted');
    } catch (err) { next(err); }
  },

  async markComplete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { completed } = z.object({ completed: z.boolean() }).parse(req.body);
      const log = await workoutService.markComplete(req.params.logId, req.user!.userId, completed);
      sendSuccess(res, log, 'Workout log updated');
    } catch (err) { next(err); }
  },

  async updateLog(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = z.object({
        bodyWeight: z.number().min(20).max(300).optional(),
        notes: z.string().optional(),
      }).parse(req.body);
      const log = await workoutService.updateLog(req.params.logId, req.user!.userId, data);
      sendSuccess(res, log, 'Workout log details updated');
    } catch (err) { next(err); }
  },

  async getCommitment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await workoutService.getCommitmentStats(req.user!.userId);
      sendSuccess(res, stats, 'Commitment stats fetched');
    } catch (err) { next(err); }
  },

  async getMemberLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await workoutService.getUserHistory(req.params.userId, 30);
      sendSuccess(res, history, 'Member workout logs');
    } catch (err) { next(err); }
  },

  async getProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const program = await workoutService.getUserProgram(req.params.userId);
      sendSuccess(res, program, 'Workout program fetched');
    } catch (err) { next(err); }
  },

  async addToProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const data = addToProgramSchema.parse(req.body);
      const item = await workoutService.addToProgram(data.userId, data);
      sendSuccess(res, item, 'Added to program', 201);
    } catch (err) { next(err); }
  },

  async removeFromProgram(req: Request, res: Response, next: NextFunction) {
    try {
      await workoutService.removeFromProgram(req.params.userId, req.params.exerciseId);
      sendSuccess(res, null, 'Removed from program');
    } catch (err) { next(err); }
  },
};
