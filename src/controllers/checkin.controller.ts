import { Request, Response, NextFunction } from 'express';
import { checkinService } from '../services/checkin.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const checkinController = {
  async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const method = req.body.method || 'MANUAL';
      const userId = req.body.userId || req.user!.userId;
      const result = await checkinService.checkIn(userId, method);
      sendSuccess(res, result, 'Check-in recorded', 201);
    } catch (err) { next(err); }
  },

  async getMyCheckins(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt((req.query.limit as string) || '30', 10);
      const checkins = await checkinService.getUserCheckins(req.user!.userId, limit);
      sendSuccess(res, checkins, 'Check-ins fetched');
    } catch (err) { next(err); }
  },

  async getAllCheckins(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await checkinService.getAllCheckins(req.query as { page?: string; limit?: string });
      sendSuccess(res, result.checkins, 'All check-ins', 200, result.meta);
    } catch (err) { next(err); }
  },

  async generateQR(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.user!.userId;
      const qrDataUrl = await checkinService.generateQRCode(userId);
      sendSuccess(res, { qrCode: qrDataUrl }, 'QR code generated');
    } catch (err) { next(err); }
  },
};
