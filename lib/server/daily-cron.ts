import cron from 'node-cron';
import { processAllDailySpendReports } from './daily-spend.js';

let isJobRunning = false;

/**
 * Initializes the automated daily spend report scheduler.
 * Runs every night at 01:00 AM (Dhaka time: UTC+6).
 */
export function initDailySpendCron() {
  // Cron syntax: 0 1 * * * = at 01:00 AM every day
  // Timezone: Asia/Dhaka
  const task = cron.schedule(
    '0 1 * * *',
    async () => {
      if (isJobRunning) {
        console.warn('[daily-cron] Previous job is still running, skipping iteration.');
        return;
      }

      isJobRunning = true;
      const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
      console.log(`\n⏰ [daily-cron] Running automated 1:00 AM daily spend email dispatch (Dhaka: ${now})...`);

      try {
        const summary = await processAllDailySpendReports();
        console.log(`✅ [daily-cron] Completed daily spend report dispatch:`, {
          date: summary.date,
          usersChecked: summary.totalUsersChecked,
          sent: summary.sentCount,
          skipped: summary.skippedCount,
          failed: summary.failedCount,
        });
      } catch (err) {
        console.error('❌ [daily-cron] Error during daily spend email dispatch:', err);
      } finally {
        isJobRunning = false;
      }
    },
    {
      timezone: 'Asia/Dhaka',
    },
  );

  console.log('  🕒 Daily spend email cron scheduled for 01:00 AM (Asia/Dhaka)');
  return task;
}
