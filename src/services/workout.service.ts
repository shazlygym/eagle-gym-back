import { workoutRepository } from '../repositories/workout.repository';
import { AppError } from '../middleware/error.middleware';

export const workoutService = {
  async getAllExercises() {
    return workoutRepository.findAllExercises();
  },

  async createExercise(data: { name: string; muscleGroup?: string }) {
    return workoutRepository.createExercise(data);
  },

  async getTodayLog(userId: string, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return workoutRepository.getOrCreateLog(userId, date);
  },

  async getLogById(logId: string, userId: string) {
    const log = await workoutRepository.getLogById(logId);
    if (!log) throw new AppError('Workout log not found', 404);
    if (log.userId !== userId) throw new AppError('Access denied', 403);
    return log;
  },

  async getUserHistory(userId: string, limit = 30) {
    return workoutRepository.getUserHistory(userId, limit);
  },

  async addSetToLog(
    logId: string,
    userId: string,
    data: { exerciseId: string; setNumber: number; reps?: number; weight?: number; targetReps?: number; targetWeight?: number }
  ) {
    const log = await workoutRepository.getUserMemberLog(userId, logId);
    if (!log) throw new AppError('Workout log not found or access denied', 404);

    try {
      return await workoutRepository.addSet({ workoutLogId: logId, ...data });
    } catch (err: unknown) {
      const error = err as Error;
      throw new AppError(error.message || 'Failed to add set', 400);
    }
  },

  async updateSet(setId: string, data: { reps?: number; weight?: number }) {
    return workoutRepository.updateSet(setId, data);
  },

  async deleteSet(setId: string) {
    return workoutRepository.deleteSet(setId);
  },

  async markComplete(logId: string, userId: string, completed: boolean) {
    const log = await workoutRepository.getUserMemberLog(userId, logId);
    if (!log) throw new AppError('Workout log not found or access denied', 404);
    return workoutRepository.markComplete(logId, completed);
  },

  async updateLog(logId: string, userId: string, data: { bodyWeight?: number; notes?: string }) {
    const log = await workoutRepository.getUserMemberLog(userId, logId);
    if (!log) throw new AppError('Workout log not found or access denied', 404);
    
    // If bodyWeight is updated, also log it as a body stat for the chart
    if (data.bodyWeight) {
      const { bodyStatService } = await import('./bodyStats.service');
      await bodyStatService.logStat({ userId, weight: data.bodyWeight, notes: 'سجلت أثناء التمرين' });
    }

    return workoutRepository.updateLog(logId, data);
  },

  async getCommitmentStats(userId: string) {
    const [weeklyCompleted, totalCompleted, frequency] = await Promise.all([
      workoutRepository.getCompletedThisWeek(userId),
      workoutRepository.getTotalCompleted(userId),
      workoutRepository.getWorkoutFrequency(userId, 30),
    ]);

    const weeklyCommitmentPct = Math.round((weeklyCompleted / 7) * 100);

    return {
      weeklyCompleted,
      weeklyCommitmentPct,
      totalCompleted,
      frequency,
    };
  },

  async getMemberWorkoutLog(userId: string) {
    return workoutRepository.getMemberLog(userId);
  },

  async getUserProgram(userId: string) {
    return workoutRepository.getUserProgram(userId);
  },

  async addToProgram(userId: string, data: { exerciseId: string; setsCount: number; dayName?: string }) {
    return workoutRepository.addToProgram(userId, data);
  },

  async removeFromProgram(userId: string, exerciseId: string) {
    return workoutRepository.removeFromProgram(userId, exerciseId);
  },
};
