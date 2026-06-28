import cron from 'node-cron';
import { getAllSubscriptions } from '../repositories/notifications.js';
import { sendPushNotification } from '../lib/webPush.js';
import prisma from '../lib/db.js';
import logger from '../utils/logger.js';
import { getTodayInUserZone } from '../utils/dates.js';

export const checkAndSendReminders = async () => {
    logger.info('Running scheduled background check for unlogged user streak reminders...');
    try {
        const subscriptions = await getAllSubscriptions();
        if (subscriptions.length === 0) {
            logger.info('No active push subscriptions found for reminder dispatch.');
            return;
        }

        const todayStr = getTodayInUserZone({ timezoneOffsetMinutes: 0 });
        const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

        for (const sub of subscriptions) {
            // Check if user logged any entry or daily log today
            const logToday = await prisma.dailyLog.findUnique({
                where: {
                    userId_logDate: {
                        userId: sub.userId,
                        logDate: todayDate
                    }
                }
            });

            if (!logToday) {
                const payload = {
                    title: 'Spendly Streak Reminder 🔥',
                    body: "Don't break your streak! Take 10 seconds to log today's expenses or tap 'no spend'.",
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    url: '/'
                };

                try {
                    await sendPushNotification({
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth }
                    }, payload);
                    logger.info({ userId: sub.userId }, 'Successfully dispatched streak reminder push notification');
                } catch (pushErr) {
                    logger.error({ err: pushErr, userId: sub.userId }, 'Failed to dispatch push notification via scheduler');
                }
            }
        }
    } catch (err) {
        logger.error({ err }, 'Error executing background streak reminder cron job');
    }
};

export const startReminderCron = () => {
    // Run at minute 0 of every hour to check user local time windows
    cron.schedule('0 * * * *', async () => {
        await checkAndSendReminders();
    });
    logger.info('Streak reminder background cron scheduler started (hourly check).');
};

export default startReminderCron;
