import { analyticsRepository } from '../repositories/analytics.repository';
import { paymentRepository } from '../repositories/payment.repository';

export const analyticsService = {
  async getDashboardKPIs() {
    return analyticsRepository.getDashboardKPIs();
  },

  async getMonthlyRevenue(months = 12) {
    return paymentRepository.getMonthlyRevenue(months);
  },

  async getMemberAnalytics(userId: string) {
    return analyticsRepository.getMemberAnalytics(userId);
  },

  async getNewMembersPerMonth(months = 6) {
    return analyticsRepository.getNewMembersPerMonth(months);
  },

  async logBodyStat(userId: string, data: { weight: number; bodyFat?: number }) {
    return analyticsRepository.logBodyStat(userId, data);
  },
};
