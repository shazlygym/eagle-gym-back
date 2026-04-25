import { paymentRepository } from '../repositories/payment.repository';
import { buildPaginationMeta } from '../utils/pagination';

export const paymentService = {
  async recordPayment(data: {
    userId: string;
    subscriptionId?: string;
    amount: number;
    method: 'CASH' | 'CARD' | 'TRANSFER';
    date?: string;
    notes?: string;
  }) {
    return paymentRepository.create({
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    });
  },

  async getPayments(params: {
    page?: string;
    limit?: string;
    userId?: string;
    month?: string;
    year?: string;
  }) {
    const { payments, total, page, limit } = await paymentRepository.findAll(params);
    return { payments, meta: buildPaginationMeta(total, page, limit) };
  },

  async getMonthlyRevenue(months = 12) {
    return paymentRepository.getMonthlyRevenue(months);
  },

  async getTotalRevenue() {
    return paymentRepository.getTotalRevenue();
  },

  async getMemberPayments(userId: string) {
    return paymentRepository.getUserPayments(userId);
  },

  async exportCsvData(params: { month?: string; year?: string }) {
    const { payments } = await paymentRepository.findAll({ ...params, limit: '9999' });
    const headers = ['ID', 'Member', 'Phone', 'Amount', 'Method', 'Date', 'Subscription', 'Notes'];
    const rows = payments.map((p) => [
      p.id,
      (p.user as { name: string }).name,
      (p.user as { phone: string }).phone,
      p.amount.toString(),
      p.method,
      new Date(p.date).toLocaleDateString('ar-EG'),
      (p.subscription as { name: string } | null)?.name || '',
      p.notes || '',
    ]);
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  },
};
