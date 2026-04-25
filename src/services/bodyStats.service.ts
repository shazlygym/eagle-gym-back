import { bodyStatRepository } from '../repositories/bodyStats.repository';

export const bodyStatService = {
  async logStat(data: {
    userId: string;
    date?: string;
    weight: number;
    bodyFat?: number;
    notes?: string;
  }) {
    const date = data.date ? new Date(data.date) : new Date();
    return bodyStatRepository.createStat({
      userId: data.userId,
      date,
      weight: data.weight,
      bodyFat: data.bodyFat,
      notes: data.notes,
    });
  },

  async getUserStats(userId: string, limit = 60) {
    return bodyStatRepository.getUserStats(userId, limit);
  },

  async getLatest(userId: string) {
    return bodyStatRepository.getLatest(userId);
  },

  async deleteStat(id: string, userId: string) {
    return bodyStatRepository.delete(id, userId);
  },
};
