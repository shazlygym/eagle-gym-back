import { PrismaClient } from '@prisma/client';
import { getPaginationParams } from '../utils/pagination';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const userRepository = {
  async findByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        membershipNumber: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        memberSubscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { subscription: true },
        },
      },
    });
  },

  async findAll(params: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  }) {
    const { page, limit, skip } = getPaginationParams(params.page, params.limit);

    const where: Record<string, unknown> = { role: 'MEMBER' };
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { phone: { contains: params.search } },
        { membershipNumber: { contains: params.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          membershipNumber: true,
          active: true,
          createdAt: true,
          memberSubscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { subscription: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  },

  async create(data: {
    name: string;
    phone: string;
    passwordHash: string;
    membershipNumber?: string;
    role?: 'ADMIN' | 'MEMBER';
  }) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: Partial<{
    name: string;
    phone: string;
    passwordHash: string;
    membershipNumber: string;
    active: boolean;
  }>) {
    return prisma.user.update({ where: { id }, data });
  },

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Member not found', 404);
    if (user.role === 'ADMIN') throw new AppError('Cannot delete admin user', 403);
    return prisma.user.delete({ where: { id } });
  },

  async countMembers() {
    return prisma.user.count({ where: { role: 'MEMBER' } });
  },

  async updateRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  },

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  async revokeRefreshToken(token: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  },

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },
};
