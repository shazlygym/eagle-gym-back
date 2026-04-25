import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { paymentService } from '../services/payment.service';
import { sendSuccess } from '../utils/response';

const recordPaymentSchema = z.object({
  userId: z.string(),
  subscriptionId: z.string().optional(),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'CARD', 'TRANSFER']).default('CASH'),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export const paymentController = {
  async record(req: Request, res: Response, next: NextFunction) {
    try {
      const data = recordPaymentSchema.parse(req.body);
      const payment = await paymentService.recordPayment(data);
      sendSuccess(res, payment, 'Payment recorded', 201);
    } catch (err) { next(err); }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, userId, month, year } = req.query as Record<string, string>;
      const result = await paymentService.getPayments({ page, limit, userId, month, year });
      sendSuccess(res, result.payments, 'Payments fetched', 200, result.meta);
    } catch (err) { next(err); }
  },

  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const months = parseInt((req.query.months as string) || '12', 10);
      const data = await paymentService.getMonthlyRevenue(months);
      sendSuccess(res, data, 'Revenue data fetched');
    } catch (err) { next(err); }
  },

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query as Record<string, string>;
      const csv = await paymentService.exportCsvData({ month, year });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');
      res.send('\uFEFF' + csv); // BOM for Excel Arabic support
    } catch (err) { next(err); }
  },

  async getMemberPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getMemberPayments(req.params.userId);
      sendSuccess(res, payments, 'Member payments fetched');
    } catch (err) { next(err); }
  },
};
