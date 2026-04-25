import { PrismaClient } from '@prisma/client';
import { getPaginationParams } from '../utils/pagination';

const prisma = new PrismaClient();

export const paymentRepository = {
  async create(data: {
    userId: string;
    subscriptionId?: string;
    amount: number;
    method: 'CASH' | 'CARD' | 'TRANSFER';
    date?: Date;
    notes?: string;
  }) {
    return prisma.payment.create({
      data,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        subscription: { select: { id: true, name: true } },
      },
    });
  },

  async findAll(params: { page?: string; limit?: string; userId?: string; month?: string; year?: string }) {
    const { page, limit, skip } = getPaginationParams(params.page, params.limit);

    const where: Record<string, unknown> = {};
    if (params.userId) where.userId = params.userId;
    if (params.month && params.year) {
      const start = new Date(parseInt(params.year), parseInt(params.month) - 1, 1);
      const end = new Date(parseInt(params.year), parseInt(params.month), 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, name: true, phone: true, membershipNumber: true } },
          subscription: { select: { id: true, name: true } },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total, page, limit };
  },

  async getMonthlyRevenue(months = 12) {
    const results = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);

      const result = await prisma.payment.aggregate({
        where: { date: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      });

      results.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: Number(result._sum.amount || 0),
        count: result._count,
      });
    }
    return results;
  },

  async getTotalRevenue() {
    const result = await prisma.payment.aggregate({ _sum: { amount: true } });
    return Number(result._sum.amount || 0);
  },

  async getUserPayments(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { subscription: { select: { name: true } } },
    });
  },
};
