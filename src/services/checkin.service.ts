import { checkinRepository } from '../repositories/checkin.repository';
import { buildPaginationMeta } from '../utils/pagination';
import QRCode from 'qrcode';

export const checkinService = {
  async checkIn(userId: string, method: 'QR' | 'MANUAL' = 'MANUAL') {
    return checkinRepository.create(userId, method);
  },

  async getUserCheckins(userId: string, limit = 30) {
    return checkinRepository.getUserCheckins(userId, limit);
  },

  async getAllCheckins(params: { page?: string; limit?: string }) {
    const { checkins, total, page, limit } = await checkinRepository.getAllCheckins(params);
    return { checkins, meta: buildPaginationMeta(total, page, limit) };
  },

  async generateQRCode(userId: string): Promise<string> {
    const payload = JSON.stringify({ userId, ts: Date.now() });
    return QRCode.toDataURL(payload);
  },

  async getTodayCount() {
    return checkinRepository.getTodayCount();
  },
};
