import { userRepository } from '../repositories/user.repository';
import { comparePassword, hashPassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authService = {
  async login(phone: string, password: string) {
    const user = await userRepository.findByPhone(phone);
    if (!user) {
      throw new AppError('Invalid phone number or password', 401);
    }
    if (!user.active) {
      throw new AppError('Your account has been deactivated. Contact gym staff.', 403);
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid phone number or password', 401);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
    });

    const tokenId = uuidv4();
    const refreshToken = generateRefreshToken({ userId: user.id, tokenId });
    const expiresAt = getRefreshTokenExpiry();

    await userRepository.updateRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        membershipNumber: user.membershipNumber,
      },
    };
  },

  async refreshTokens(oldRefreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const stored = await userRepository.findRefreshToken(oldRefreshToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new AppError('Refresh token is expired or revoked', 401);
    }

    const userRecord = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!userRecord) {
      throw new AppError('User not found', 404);
    }

    // Rotate: revoke old, issue new
    await userRepository.revokeRefreshToken(oldRefreshToken);

    const accessToken = generateAccessToken({
      userId: userRecord.id,
      role: userRecord.role,
      phone: userRecord.phone,
    });

    const tokenId = uuidv4();
    const newRefreshToken = generateRefreshToken({ userId: userRecord.id, tokenId });
    const expiresAt = getRefreshTokenExpiry();

    await userRepository.updateRefreshToken(userRecord.id, newRefreshToken, expiresAt);

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string) {
    try {
      await userRepository.revokeRefreshToken(refreshToken);
    } catch {
      // Token may not exist, that's OK
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const fullUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!fullUser) throw new AppError('User not found', 404);

    const isValid = await comparePassword(currentPassword, fullUser.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const newHash = await hashPassword(newPassword);
    await userRepository.update(userId, { passwordHash: newHash });

    // Revoke all refresh tokens for security
    await userRepository.revokeAllUserTokens(userId);

    return { message: 'Password changed successfully' };
  },
};
