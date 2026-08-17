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

        // PERFORMANCE DECISION (Batching):
        // Batch query daily logs for all subscribed users today in a single SQL query
        // using `WHERE userId IN (...) AND logDate = today`.
        // Avoids the N+1 query problem of checking each subscription sequentially.
        const userIds = [...new Set(subscriptions.map(s => s.userId))];
        const existingLogs = await prisma.dailyLog.findMany({
            where: {
                userId: { in: userIds },
                logDate: todayDate
            },
            select: { userId: true }
        });

        const loggedUserIds = new Set(existingLogs.map(l => l.userId));
        const unloggedSubscriptions = subscriptions.filter(sub => !loggedUserIds.has(sub.userId));

        if (unloggedSubscriptions.length === 0) {
            logger.info('All subscribed users have already logged today. No reminders needed.');
            return;
        }

        const payload = {
            title: 'Spendly Streak Reminder 🔥',
            body: "Don't break your streak! Take 10 seconds to log today's expenses or tap 'no spend'.",
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            url: '/'
        };

        // PERFORMANCE DECISION (Concurrency & Fault Isolation):
        // Dispatch notifications in parallel chunks of 10 using `Promise.allSettled`.
        // This avoids blocking the event loop on external Web Push HTTP round-trips
        // while preventing socket exhaustion and rate-limit spikes on push gateways.
        const CHUNK_SIZE = 10;
        for (let i = 0; i < unloggedSubscriptions.length; i += CHUNK_SIZE) {
            const chunk = unloggedSubscriptions.slice(i, i + CHUNK_SIZE);
            await Promise.allSettled(
                chunk.map(async (sub) => {
                    try {
                        await sendPushNotification({
                            endpoint: sub.endpoint,
                            keys: { p256dh: sub.p256dh, auth: sub.auth }
                        }, payload);
                        logger.info({ userId: sub.userId }, 'Successfully dispatched streak reminder push notification');
                    } catch (pushErr) {
                        logger.error({ err: pushErr, userId: sub.userId }, 'Failed to dispatch push notification via scheduler');
                    }
                })
            );
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
