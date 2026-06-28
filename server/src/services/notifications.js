import * as notificationsRepo from '../repositories/notifications.js';
import { getVapidPublicKey, sendPushNotification as sendWebPush } from '../lib/webPush.js';
import redis from '../streak-engine/startUp.js';
import logger from '../utils/logger.js';

export const fetchVapidPublicKey = () => {
    return getVapidPublicKey();
};

export const saveSubscription = async (userId, { endpoint, keys }) => {
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        throw new Error('Invalid push subscription format');
    }

    const sub = await notificationsRepo.upsertSubscription(userId, {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
    });

    try {
        const cacheKey = `push_subs:${userId}`;
        await redis.sAdd(cacheKey, JSON.stringify({ endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } }));
        logger.info({ userId }, 'Saved push subscription to Redis cache');
    } catch (err) {
        logger.error({ err, userId }, 'Failed to cache push subscription in Redis');
    }

    return sub;
};

export const removeSubscription = async (userId, endpoint) => {
    const result = await notificationsRepo.deleteSubscription(endpoint);
    try {
        const cacheKey = `push_subs:${userId}`;
        await redis.del(cacheKey);
    } catch (err) {
        logger.error({ err, userId }, 'Failed to clear push subscription Redis cache');
    }
    return result;
};

export const dispatchNotificationToUser = async (userId, payload) => {
    const subs = await notificationsRepo.getSubscriptionsByUserId(userId);
    const results = [];

    for (const sub of subs) {
        try {
            const pushFormat = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };
            await sendWebPush(pushFormat, payload);
            results.push({ endpoint: sub.endpoint, success: true });
        } catch (err) {
            logger.error({ err, endpoint: sub.endpoint }, 'Failed to send notification to device endpoint');
            results.push({ endpoint: sub.endpoint, success: false, error: err.message });
        }
    }

    return results;
};
