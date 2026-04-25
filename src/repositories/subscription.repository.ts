import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const subscriptionRepository = {
  async findAll() {
    return prisma.subscription.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.subscription.findUnique({ where: { id } });
  },

  async create(data: {
    name: string;
    durationDays: number;
    price: number;
    description?: string;
  }) {
    return prisma.subscription.create({ data });
  },

  async update(id: string, data: Partial<{
    name: string;
    durationDays: number;
    price: number;
    description: string;
    active: boolean;
  }>) {
    return prisma.subscription.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.subscription.update({
      where: { id },
      data: { active: false },
    });
  },

  // Member Subscriptions
  async assignToMember(data: {
    userId: string;
    subscriptionId: string;
    startDate: Date;
    endDate: Date;
  }) {
    // Cancel any existing active subscription
    await prisma.memberSubscription.updateMany({
      where: { userId: data.userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    return prisma.memberSubscription.create({
      data: { ...data, status: 'ACTIVE' },
      include: { subscription: true },
    });
  },

  async getMemberSubscription(userId: string) {
    return prisma.memberSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { subscription: true },
    });
  },

  async getMemberSubscriptionHistory(userId: string) {
    return prisma.memberSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { subscription: true },
    });
  },

  // Auto-expire subscriptions
  async expireOutdated() {
    return prisma.memberSubscription.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
  },

  async countActive() {
    return prisma.memberSubscription.count({ where: { status: 'ACTIVE' } });
  },

  async countExpired() {
    return prisma.memberSubscription.count({ where: { status: 'EXPIRED' } });
  },
};
