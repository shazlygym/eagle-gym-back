import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Eagle Gym database...');

  // ─── Admin User ───────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { phone: '01025754947' },
    update: {},
    create: {
      name: 'Eagle Gym Admin',
      phone: '01025754947',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.phone);

  // ─── Subscription Plans ───────────────────────────────────────────
  const plans = await Promise.all([
    prisma.subscription.upsert({
      where: { id: 'plan-monthly' },
      update: {},
      create: {
        id: 'plan-monthly',
        name: 'شهري',
        durationDays: 30,
        price: 300,
        description: 'اشتراك شهري كامل مع الوصول لجميع المرافق',
      },
    }),
    prisma.subscription.upsert({
      where: { id: 'plan-quarterly' },
      update: {},
      create: {
        id: 'plan-quarterly',
        name: 'ربع سنوي',
        durationDays: 90,
        price: 800,
        description: 'اشتراك 3 أشهر بسعر مميز',
      },
    }),
    prisma.subscription.upsert({
      where: { id: 'plan-annual' },
      update: {},
      create: {
        id: 'plan-annual',
        name: 'سنوي',
        durationDays: 365,
        price: 2500,
        description: 'اشتراك سنوي كامل بأفضل سعر',
      },
    }),
    prisma.subscription.upsert({
      where: { id: 'plan-weekly' },
      update: {},
      create: {
        id: 'plan-weekly',
        name: 'أسبوعي',
        durationDays: 7,
        price: 100,
        description: 'اشتراك تجريبي لمدة أسبوع',
      },
    }),
  ]);
  console.log('✅ Subscription plans created:', plans.length);

  // ─── Exercises ────────────────────────────────────────────────────
  const exercises = await Promise.all([
    prisma.exercise.upsert({ where: { id: 'ex-bench' }, update: {}, create: { id: 'ex-bench', name: 'بنش برس', muscleGroup: 'صدر' } }),
    prisma.exercise.upsert({ where: { id: 'ex-squat' }, update: {}, create: { id: 'ex-squat', name: 'سكوات', muscleGroup: 'أرجل' } }),
    prisma.exercise.upsert({ where: { id: 'ex-deadlift' }, update: {}, create: { id: 'ex-deadlift', name: 'ديد ليفت', muscleGroup: 'ظهر' } }),
    prisma.exercise.upsert({ where: { id: 'ex-pullup' }, update: {}, create: { id: 'ex-pullup', name: 'عقلة', muscleGroup: 'ظهر' } }),
    prisma.exercise.upsert({ where: { id: 'ex-shoulder' }, update: {}, create: { id: 'ex-shoulder', name: 'برس كتف', muscleGroup: 'أكتاف' } }),
    prisma.exercise.upsert({ where: { id: 'ex-curl' }, update: {}, create: { id: 'ex-curl', name: 'كيرل بايسبس', muscleGroup: 'بايسبس' } }),
    prisma.exercise.upsert({ where: { id: 'ex-tricep' }, update: {}, create: { id: 'ex-tricep', name: 'ضغط ترايسبس', muscleGroup: 'ترايسبس' } }),
    prisma.exercise.upsert({ where: { id: 'ex-lunge' }, update: {}, create: { id: 'ex-lunge', name: 'لانج', muscleGroup: 'أرجل' } }),
    prisma.exercise.upsert({ where: { id: 'ex-plank' }, update: {}, create: { id: 'ex-plank', name: 'بلانك', muscleGroup: 'كور' } }),
    prisma.exercise.upsert({ where: { id: 'ex-row' }, update: {}, create: { id: 'ex-row', name: 'رووينج', muscleGroup: 'ظهر' } }),
  ]);
  console.log('✅ Exercises created:', exercises.length);

  // ─── Sample Members ───────────────────────────────────────────────
  const member1Hash = await bcrypt.hash('member123', 12);
  const member1 = await prisma.user.upsert({
    where: { phone: '01012345678' },
    update: {},
    create: {
      name: 'أحمد محمد',
      phone: '01012345678',
      passwordHash: member1Hash,
      role: 'MEMBER',
      membershipNumber: 'EG001',
    },
  });

  const member2Hash = await bcrypt.hash('member123', 12);
  const member2 = await prisma.user.upsert({
    where: { phone: '01098765432' },
    update: {},
    create: {
      name: 'محمد علي',
      phone: '01098765432',
      passwordHash: member2Hash,
      role: 'MEMBER',
      membershipNumber: 'EG002',
    },
  });

  const member3Hash = await bcrypt.hash('member123', 12);
  const member3 = await prisma.user.upsert({
    where: { phone: '01155554444' },
    update: {},
    create: {
      name: 'كريم إبراهيم',
      phone: '01155554444',
      passwordHash: member3Hash,
      role: 'MEMBER',
      membershipNumber: 'EG003',
    },
  });
  console.log('✅ Members created');

  // ─── Assign Subscriptions ─────────────────────────────────────────
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  await prisma.memberSubscription.upsert({
    where: { id: 'ms-001' },
    update: {},
    create: {
      id: 'ms-001',
      userId: member1.id,
      subscriptionId: 'plan-monthly',
      startDate,
      endDate,
      status: 'ACTIVE',
    },
  });

  const endDate2 = new Date();
  endDate2.setDate(endDate2.getDate() + 90);
  await prisma.memberSubscription.upsert({
    where: { id: 'ms-002' },
    update: {},
    create: {
      id: 'ms-002',
      userId: member2.id,
      subscriptionId: 'plan-quarterly',
      startDate,
      endDate: endDate2,
      status: 'ACTIVE',
    },
  });

  // Expired subscription for member3
  const expiredStart = new Date();
  expiredStart.setDate(expiredStart.getDate() - 40);
  const expiredEnd = new Date();
  expiredEnd.setDate(expiredEnd.getDate() - 10);
  await prisma.memberSubscription.upsert({
    where: { id: 'ms-003' },
    update: {},
    create: {
      id: 'ms-003',
      userId: member3.id,
      subscriptionId: 'plan-monthly',
      startDate: expiredStart,
      endDate: expiredEnd,
      status: 'EXPIRED',
    },
  });
  console.log('✅ Subscriptions assigned');

  // ─── Sample Payments ──────────────────────────────────────────────
  await prisma.payment.createMany({
    data: [
      { userId: member1.id, subscriptionId: 'plan-monthly', amount: 300, method: 'CASH' },
      { userId: member2.id, subscriptionId: 'plan-quarterly', amount: 800, method: 'CARD' },
      { userId: member3.id, subscriptionId: 'plan-monthly', amount: 300, method: 'CASH' },
    ],
  });
  console.log('✅ Payments recorded');

  // ─── Sample Check-ins ─────────────────────────────────────────────
  await prisma.checkIn.createMany({
    data: [
      { userId: member1.id, method: 'MANUAL' },
      { userId: member2.id, method: 'MANUAL' },
      { userId: member1.id, method: 'QR' },
    ],
  });
  console.log('✅ Check-ins recorded');

  // ─── Sample Body Stats ────────────────────────────────────────────
  const today = new Date();
  const bodyStatDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 7);
    return d;
  });

  for (let i = 0; i < bodyStatDates.length; i++) {
    await prisma.bodyStat.create({
      data: {
        userId: member1.id,
        date: bodyStatDates[i],
        weight: 85 - i * 0.5,
        bodyFat: 18 - i * 0.3,
        notes: i === 0 ? 'بداية القياس' : undefined,
      },
    });
  }
  console.log('✅ Body stats recorded');

  console.log(`
🎉 Seeding complete!

📋 Admin Account:
   Phone:    01025754947
   Password: admin123

👥 Sample Members:
   أحمد محمد  | 01012345678 | EG001 | active
   محمد علي   | 01098765432 | EG002 | active
   كريم إبراهيم | 01155554444 | EG003 | expired

   All member passwords: member123
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
