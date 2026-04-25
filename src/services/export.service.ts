import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ExportService = {
  async getMembersCsv(): Promise<string> {
    const members = await prisma.user.findMany({
      where: { role: 'MEMBER' },
      include: {
        memberSubscriptions: {
          include: { subscription: true },
          orderBy: { endDate: 'desc' },
          take: 1
        }
      }
    });

    const data = members.map(m => {
      const activeSub = m.memberSubscriptions[0];
      return {
        ID: m.id,
        Name: m.name,
        Phone: m.phone,
        'Membership Number': m.membershipNumber || '',
        Status: m.active ? 'Active' : 'Inactive',
        'Joined At': m.createdAt.toISOString().split('T')[0],
        'Current Plan': activeSub?.subscription?.name || 'None',
        'Plan Expiry': activeSub ? activeSub.endDate.toISOString().split('T')[0] : ''
      };
    });

    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => headers.map(h => `"${(row as Record<string, string>)[h] ?? ''}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
  },

  async getPaymentsCsv(): Promise<string> {
    const payments = await prisma.payment.findMany({
      include: {
        user: true,
        subscription: true
      },
      orderBy: { date: 'desc' }
    });

    const data = payments.map(p => ({
      ID: p.id,
      Date: p.date.toISOString().split('T')[0],
      'Member Name': p.user.name,
      'Member Phone': p.user.phone,
      Amount: p.amount.toString(),
      Method: p.method,
      'Subscription': p.subscription?.name || 'Custom',
      Notes: p.notes || ''
    }));

    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => headers.map(h => `"${(row as Record<string, string>)[h] ?? ''}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
  },

  async getWorkoutsCsv(): Promise<string> {
    const workouts = await prisma.workoutLog.findMany({
      include: {
        user: true,
        workoutSets: {
          include: { exercise: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    const data = workouts.flatMap(w => {
      if (w.workoutSets.length === 0) {
        return [{
          Date: w.date.toISOString().split('T')[0],
          'Member Name': w.user.name,
          Exercise: 'No exercises',
          Set: '',
          Reps: '',
          Weight: ''
        }];
      }
      return w.workoutSets.map(set => ({
        Date: w.date.toISOString().split('T')[0],
        'Member Name': w.user.name,
        Exercise: set.exercise.name,
        Set: String(set.setNumber),
        Reps: String(set.reps),
        Weight: String(set.weight)
      }));
    });

    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => headers.map(h => `"${(row as Record<string, string>)[h] ?? ''}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};