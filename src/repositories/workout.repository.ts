import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const workoutRepository = {
  async findAllExercises() {
    return prisma.exercise.findMany({ orderBy: { name: 'asc' } });
  },

  async createExercise(data: { name: string; muscleGroup?: string }) {
    return prisma.exercise.create({ data });
  },

  async findExerciseById(id: string) {
    return prisma.exercise.findUnique({ where: { id } });
  },

  async getOrCreateLog(userId: string, date: Date) {
    const dateOnly = new Date(date.toISOString().split('T')[0]);

    const existing = await prisma.workoutLog.findUnique({
      where: { userId_date: { userId, date: dateOnly } },
      include: {
        workoutSets: {
          include: { exercise: true },
          orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
        },
      },
    });

    if (existing) return existing;

    // Find the most recent previous log to copy targets from
    const lastLog = await prisma.workoutLog.findFirst({
      where: { userId, date: { lt: dateOnly } },
      orderBy: { date: 'desc' },
      include: { workoutSets: true },
    });

    // Create new log
    const log = await prisma.workoutLog.create({
      data: { 
        userId, 
        date: dateOnly,
        bodyWeight: lastLog?.bodyWeight || null 
      },
    });

    // Initialize from program if exists
    const program = await this.getUserProgram(userId);
    if (program.length > 0) {
      for (const p of program) {
        // Find previous performance for this specific exercise
        const prevSets = lastLog?.workoutSets.filter(s => s.exerciseId === p.exerciseId) || [];
        
        for (let i = 1; i <= p.setsCount; i++) {
          const prevSet = prevSets.find(s => s.setNumber === i) || prevSets[prevSets.length - 1];
          
          await prisma.workoutSet.create({
            data: {
              workoutLogId: log.id,
              exerciseId: p.exerciseId,
              setNumber: i,
              targetWeight: prevSet?.weight || null,
              targetReps: prevSet?.reps || null,
            },
          });
        }
      }
    }

    return prisma.workoutLog.findUnique({
      where: { id: log.id },
      include: {
        workoutSets: {
          include: { exercise: true },
          orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
        },
      },
    });
  },

  async getUserProgram(userId: string) {
    return prisma.workoutProgram.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async addToProgram(userId: string, data: { exerciseId: string; setsCount: number; dayName?: string }) {
    const dayName = data.dayName || 'General';
    return prisma.workoutProgram.upsert({
      where: { userId_exerciseId_dayName: { userId, exerciseId: data.exerciseId, dayName } },
      update: { setsCount: data.setsCount },
      create: { userId, exerciseId: data.exerciseId, dayName, setsCount: data.setsCount },
    });
  },

async removeFromProgram(userId: string, exerciseId: string) {
    const item = await prisma.workoutProgram.findFirst({
      where: { userId, exerciseId },
    });
    if (!item) throw new Error('Program item not found');
    return prisma.workoutProgram.delete({
      where: { id: item.id },
    });
  },
  async getLogById(id: string) {
    return prisma.workoutLog.findUnique({
      where: { id },
      include: {
        workoutSets: {
          include: { exercise: true },
          orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
        },
      },
    });
  },

  async getUserHistory(userId: string, limit = 30) {
    return prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        workoutSets: {
          include: { exercise: true },
          orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
        },
      },
    });
  },

  async addSet(data: {
    workoutLogId: string;
    exerciseId: string;
    setNumber: number;
    reps?: number;
    weight?: number;
    targetReps?: number;
    targetWeight?: number;
  }) {
    const existingSets = await prisma.workoutSet.count({
      where: {
        workoutLogId: data.workoutLogId,
        exerciseId: data.exerciseId,
      },
    });
    if (existingSets >= 10) {
      throw new Error('Maximum 10 sets per exercise allowed');
    }

    return prisma.workoutSet.create({ data });
  },

  async updateSet(id: string, data: { reps?: number; weight?: number }) {
    return prisma.workoutSet.update({ where: { id }, data });
  },

  async deleteSet(id: string) {
    return prisma.workoutSet.delete({ where: { id } });
  },

  async markComplete(logId: string, completed: boolean) {
    return prisma.workoutLog.update({
      where: { id: logId },
      data: { completed },
    });
  },

  async updateLog(id: string, data: { bodyWeight?: number; notes?: string }) {
    return prisma.workoutLog.update({
      where: { id },
      data,
    });
  },

  async getUserMemberLog(userId: string, logId: string) {
    return prisma.workoutLog.findFirst({ where: { id: logId, userId } });
  },

  async getCompletedThisWeek(userId: string): Promise<number> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return prisma.workoutLog.count({
      where: { userId, completed: true, date: { gte: startOfWeek } },
    });
  },

  async getTotalCompleted(userId: string): Promise<number> {
    return prisma.workoutLog.count({ where: { userId, completed: true } });
  },

  async getWorkoutFrequency(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return prisma.workoutLog.findMany({
      where: { userId, completed: true, date: { gte: since } },
      select: { date: true, completed: true },
      orderBy: { date: 'asc' },
    });
  },

  async getMemberLog(userId: string) {
    return prisma.workoutLog.findMany({
      where: { userId },
      select: { date: true, completed: true },
      orderBy: { date: 'desc' },
      take: 60,
    });
  },
};
