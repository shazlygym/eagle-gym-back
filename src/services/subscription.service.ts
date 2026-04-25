import { subscriptionRepository } from '../repositories/subscription.repository';
import { AppError } from '../middleware/error.middleware';

export const subscriptionService = {
  async getAllPlans() {
    return subscriptionRepository.findAll();
  },

  async getPlanById(id: string) {
    const plan = await subscriptionRepository.findById(id);
    if (!plan) throw new AppError('Subscription plan not found', 404);
    return plan;
  },

  async createPlan(data: {
    name: string;
    durationDays: number;
    price: number;
    description?: string;
  }) {
    return subscriptionRepository.create(data);
  },

  async updatePlan(id: string, data: Partial<{
    name: string;
    durationDays: number;
    price: number;
    description: string;
    active: boolean;
  }>) {
    return subscriptionRepository.update(id, data);
  },

  async deletePlan(id: string) {
    return subscriptionRepository.delete(id);
  },

  async assignToMember(data: {
    userId: string;
    subscriptionId: string;
    startDate?: string;
  }) {
    const plan = await subscriptionRepository.findById(data.subscriptionId);
    if (!plan) throw new AppError('Subscription plan not found', 404);

    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    return subscriptionRepository.assignToMember({
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      startDate,
      endDate,
    });
  },

  async getMemberSubscription(userId: string) {
    return subscriptionRepository.getMemberSubscription(userId);
  },

  async getMemberSubscriptionHistory(userId: string) {
    return subscriptionRepository.getMemberSubscriptionHistory(userId);
  },

  async autoExpire() {
    return subscriptionRepository.expireOutdated();
  },
};
