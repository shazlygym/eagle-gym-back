import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const analyticsRepository = {
  async getDashboardKPIs() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalMembers,
      activeSubscriptions,
      expiredSubscriptions,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      todayCheckins,
      totalCheckins,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.memberSubscription.count({ where: { status: 'ACTIVE' } }),
      prisma.memberSubscription.count({ where: { status: 'EXPIRED' } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.payment.aggregate({
        where: { date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { amount: true },
      }),
      prisma.checkIn.count({ where: { timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.checkIn.count(),
    ]);

    // Engagement: members with a completed workout in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeMembers = await prisma.workoutLog.groupBy({
      by: ['userId'],
      where: { completed: true, date: { gte: thirtyDaysAgo } },
    });

    const engagementRate = totalMembers > 0
      ? Math.round((activeMembers.length / totalMembers) * 100)
      : 0;

    return {
      totalMembers,
      activeSubscriptions,
      expiredSubscriptions,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
      lastMonthRevenue: Number(lastMonthRevenue._sum.amount || 0),
      todayCheckins,
      totalCheckins,
      engagementRate,
      activeMembers: activeMembers.length,
    };
  },

  async getMemberAnalytics(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalWorkouts,
      completedWorkouts,
      weeklyWorkouts,
      bodyStats,
      lastCheckin,
      subscription,
    ] = await Promise.all([
      prisma.workoutLog.count({ where: { userId } }),
      prisma.workoutLog.count({ where: { userId, completed: true } }),
      prisma.workoutLog.count({
        where: { userId, completed: true, date: { gte: startOfWeek } },
      }),
      prisma.bodyStat.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        take: 30,
      }),
      prisma.checkIn.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.memberSubscription.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { subscription: true },
      }),
    ]);

    const commitmentRate = totalWorkouts > 0
      ? Math.round((completedWorkouts / totalWorkouts) * 100)
      : 0;

    const weeklyCommitment = Math.round((weeklyWorkouts / 7) * 100);

    return {
      totalWorkouts,
      completedWorkouts,
      weeklyWorkouts,
      commitmentRate,
      weeklyCommitment,
      bodyStats,
      lastCheckin,
      subscription,
    };
  },

  async getNewMembersPerMonth(months = 6) {
    const results = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);

      const count = await prisma.user.count({
        where: {
          role: 'MEMBER',
          createdAt: { gte: start, lte: end },
        },
      });

      results.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count,
      });
    }
    return results;
  },
  async logBodyStat(userId: string, data: { weight: number; bodyFat?: number }) {
    return prisma.bodyStat.create({
      data: {
        userId,
        weight: data.weight,
        bodyFat: data.bodyFat,
        date: new Date(),
      },
    });
  },
};
