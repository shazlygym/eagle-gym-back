import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { ExportService } from './export.service';

export const BackupService = {
  init() {
    // Run daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running daily backup job...');
      await this.runBackup();
    });
  },

  async runBackup() {
    try {
      const date = new Date().toISOString().split('T')[0];
      const backupDir = path.join(process.cwd(), 'backups');

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const membersCsv = await ExportService.getMembersCsv();
      const paymentsCsv = await ExportService.getPaymentsCsv();

      fs.writeFileSync(path.join(backupDir, `members-${date}.csv`), membersCsv);
      fs.writeFileSync(path.join(backupDir, `payments-${date}.csv`), paymentsCsv);

      console.log(`Successfully created backups for ${date}`);
    } catch (error) {
      console.error('Error running daily backup:', error);
    }
  }
};
