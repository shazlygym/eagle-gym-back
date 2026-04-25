import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { memberService } from '../services/member.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  membershipNumber: z.string().optional(),
});

const updateMemberSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6).optional(),
  membershipNumber: z.string().optional(),
  active: z.boolean().optional(),
});

export const memberController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createMemberSchema.parse(req.body);
      const member = await memberService.createMember(data);
      sendSuccess(res, member, 'Member created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status } = req.query as Record<string, string>;
      const result = await memberService.getMembers({ page, limit, search, status });
      sendSuccess(res, result.members, 'Members fetched', 200, result.meta);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await memberService.getMemberById(req.params.id);
      sendSuccess(res, member, 'Member fetched');
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateMemberSchema.parse(req.body);
      const member = await memberService.updateMember(req.params.id, data);
      sendSuccess(res, member, 'Member updated');
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await memberService.deleteMember(req.params.id);
      sendSuccess(res, null, 'Member deleted');
    } catch (err) {
      next(err);
    }
  },

  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await memberService.getMemberById(req.user!.userId);
      sendSuccess(res, member, 'Profile fetched');
    } catch (err) {
      next(err);
    }
  },
};
