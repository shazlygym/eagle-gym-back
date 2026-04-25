import 'dotenv/config';
import app from './app';
import { config } from './config';
import { PrismaClient } from '@prisma/client';
import { subscriptionService } from './services/subscription.service';
import { BackupService } from './services/backup.service';

const prisma = new PrismaClient();

async function main() {
  // Test DB connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  // Initialize automated backups
  BackupService.init();

  // Auto-expire subscriptions every hour
  setInterval(async () => {
    try {
      const result = await subscriptionService.autoExpire();
      if (result.count > 0) {
        console.log(`⏰ Auto-expired ${result.count} subscription(s)`);
      }
    } catch (err) {
      console.error('Auto-expire error:', err);
    }
  }, 60 * 60 * 1000);

  app.listen(config.port, () => {
    console.log(`
🦅 Eagle Gym Backend API
🚀 Server running on http://localhost:${config.port}
🌍 Environment: ${config.nodeEnv}
📦 Database: MySQL
    `);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
