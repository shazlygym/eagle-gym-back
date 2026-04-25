import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { analyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

export const analyticsController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDashboardKPIs();
      sendSuccess(res, data, 'Dashboard KPIs');
    } catch (err) { next(err); }
  },

  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const months = parseInt((req.query.months as string) || '12', 10);
      const data = await analyticsService.getMonthlyRevenue(months);
      sendSuccess(res, data, 'Revenue data');
    } catch (err) { next(err); }
  },

  async getMemberAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getMemberAnalytics(req.params.userId);
      sendSuccess(res, data, 'Member analytics');
    } catch (err) { next(err); }
  },

  async getMyAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getMemberAnalytics(req.user!.userId);
      sendSuccess(res, data, 'My analytics');
    } catch (err) { next(err); }
  },

  async getNewMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const months = parseInt((req.query.months as string) || '6', 10);
      const data = await analyticsService.getNewMembersPerMonth(months);
      sendSuccess(res, data, 'New members per month');
    } catch (err) { next(err); }
  },

  async logStats(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        weight: z.number().min(20).max(300),
        bodyFat: z.number().optional(),
      });
      const data = schema.parse(req.body);
      const stat = await analyticsService.logBodyStat(req.user!.userId, data);
      sendSuccess(res, stat, 'Body stats logged successfully');
    } catch (err) { next(err); }
  },
};
