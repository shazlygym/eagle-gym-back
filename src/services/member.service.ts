import { userRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/password';
import { AppError } from '../middleware/error.middleware';
import { buildPaginationMeta } from '../utils/pagination';

export const memberService = {
  async createMember(data: {
    name: string;
    phone: string;
    password: string;
    membershipNumber?: string;
  }) {
    const existing = await userRepository.findByPhone(data.phone);
    if (existing) {
      throw new AppError('Phone number already registered', 409);
    }

    const passwordHash = await hashPassword(data.password);

    return userRepository.create({
      name: data.name,
      phone: data.phone,
      passwordHash,
      membershipNumber: data.membershipNumber,
      role: 'MEMBER',
    });
  },

  async getMembers(params: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  }) {
    const { users, total, page, limit } = await userRepository.findAll(params);
    return {
      members: users,
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getMemberById(id: string) {
    const member = await userRepository.findById(id);
    if (!member) throw new AppError('Member not found', 404);
    return member;
  },

  async updateMember(
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      password: string;
      membershipNumber: string;
      active: boolean;
    }>
  ) {
    const updateData: Record<string, unknown> = { ...data };

    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
      delete updateData.password;
    }

    if (data.phone) {
      const existing = await userRepository.findByPhone(data.phone);
      if (existing && existing.id !== id) {
        throw new AppError('Phone number already in use', 409);
      }
    }

    return userRepository.update(id, updateData as Parameters<typeof userRepository.update>[1]);
  },

  async deleteMember(id: string) {
    return userRepository.delete(id);
  },
};
