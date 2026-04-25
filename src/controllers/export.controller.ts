import { Request, Response, NextFunction } from 'express';
import { ExportService } from '../services/export.service';

export const ExportController = {
  async exportMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await ExportService.getMembersCsv();
      res.header('Content-Type', 'text/csv');
      res.attachment('members.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  async exportPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await ExportService.getPaymentsCsv();
      res.header('Content-Type', 'text/csv');
      res.attachment('payments.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  async exportWorkouts(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await ExportService.getWorkoutsCsv();
      res.header('Content-Type', 'text/csv');
      res.attachment('workouts.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }
};
