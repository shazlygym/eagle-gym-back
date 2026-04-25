import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { subscriptionService } from '../services/subscription.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createPlanSchema = z.object({
  name: z.string().min(2),
  durationDays: z.number().int().positive(),
  price: z.number().positive(),
  description: z.string().optional(),
});

const assignSchema = z.object({
  userId: z.string(),
  subscriptionId: z.string(),
  startDate: z.string().optional(),
});

export const subscriptionController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await subscriptionService.getAllPlans();
      sendSuccess(res, plans, 'Subscription plans fetched');
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPlanSchema.parse(req.body);
      const plan = await subscriptionService.createPlan(data);
      sendSuccess(res, plan, 'Plan created', 201);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await subscriptionService.updatePlan(req.params.id, req.body);
      sendSuccess(res, plan, 'Plan updated');
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await subscriptionService.deletePlan(req.params.id);
      sendSuccess(res, null, 'Plan deleted');
    } catch (err) { next(err); }
  },

  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const data = assignSchema.parse(req.body);
      const result = await subscriptionService.assignToMember(data);
      sendSuccess(res, result, 'Subscription assigned', 201);
    } catch (err) { next(err); }
  },

  async mySubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionService.getMemberSubscription(req.user!.userId);
      sendSuccess(res, sub, 'My subscription');
    } catch (err) { next(err); }
  },

  async memberSubscriptionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await subscriptionService.getMemberSubscriptionHistory(req.params.userId);
      sendSuccess(res, history, 'Subscription history');
    } catch (err) { next(err); }
  },
};
