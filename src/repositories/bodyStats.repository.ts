import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const bodyStatRepository = {
  async create(data: {
    userId: string;
    date: Date;
    weight: number;
    bodyFat?: number;
    notes?: string;
  }) {
    const dateOnly = new Date(data.date.toISOString().split('T')[0]);
    return prisma.bodyStat.upsert({
      where: {
        id: `${data.userId}_${dateOnly.toISOString().split('T')[0]}`,
      },
      create: { ...data, date: dateOnly },
      update: { weight: data.weight, bodyFat: data.bodyFat, notes: data.notes },
    });
  },

  async createStat(data: {
    userId: string;
    date: Date;
    weight: number;
    bodyFat?: number;
    notes?: string;
  }) {
    const dateOnly = new Date(data.date.toISOString().split('T')[0]);
    return prisma.bodyStat.create({ data: { ...data, date: dateOnly } });
  },

  async getUserStats(userId: string, limit = 60) {
    return prisma.bodyStat.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      take: limit,
    });
  },

  async getLatest(userId: string) {
    return prisma.bodyStat.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  },

  async delete(id: string, userId: string) {
    return prisma.bodyStat.deleteMany({ where: { id, userId } });
  },
};
