import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkinRepository = {
  async create(userId: string, method: 'QR' | 'MANUAL' = 'MANUAL') {
    return prisma.checkIn.create({
      data: { userId, method },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
  },

  async getUserCheckins(userId: string, limit = 30) {
    return prisma.checkIn.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  },

  async getAllCheckins(params: { page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(params.page || '1', 10));
    const limit = Math.min(100, parseInt(params.limit || '20', 10));
    const skip = (page - 1) * limit;

    const [checkins, total] = await Promise.all([
      prisma.checkIn.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { id: true, name: true, phone: true, membershipNumber: true } } },
      }),
      prisma.checkIn.count(),
    ]);

    return { checkins, total, page, limit };
  },

  async getTodayCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.checkIn.count({ where: { timestamp: { gte: today } } });
  },
};
