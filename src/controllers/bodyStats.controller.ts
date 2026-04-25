import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { bodyStatService } from '../services/bodyStats.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const logStatSchema = z.object({
  date: z.string().optional(),
  weight: z.number().positive(),
  bodyFat: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const bodyStatController = {
  async logStat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = logStatSchema.parse(req.body);
      const stat = await bodyStatService.logStat({ userId: req.user!.userId, ...data });
      sendSuccess(res, stat, 'Body stat logged', 201);
    } catch (err) { next(err); }
  },

  async getMyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt((req.query.limit as string) || '60', 10);
      const stats = await bodyStatService.getUserStats(req.user!.userId, limit);
      sendSuccess(res, stats, 'Body stats fetched');
    } catch (err) { next(err); }
  },

  async getLatest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stat = await bodyStatService.getLatest(req.user!.userId);
      sendSuccess(res, stat, 'Latest body stat');
    } catch (err) { next(err); }
  },

  async deleteStat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bodyStatService.deleteStat(req.params.id, req.user!.userId);
      sendSuccess(res, null, 'Stat deleted');
    } catch (err) { next(err); }
  },

  async getMemberStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await bodyStatService.getUserStats(req.params.userId, 60);
      sendSuccess(res, stats, 'Member body stats');
    } catch (err) { next(err); }
  },
};
