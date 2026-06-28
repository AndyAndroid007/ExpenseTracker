import * as notificationsService from '../services/notifications.js';
import logger from '../utils/logger.js';

export const getVapidKey = async (req, res, next) => {
    try {
        const publicKey = notificationsService.fetchVapidPublicKey();
        return res.status(200).json({ publicKey });
    } catch (err) {
        next(err);
    }
};

export const subscribe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { subscription } = req.body;
        const sub = await notificationsService.saveSubscription(userId, subscription);
        logger.info({ userId }, 'Successfully subscribed user to web push notifications');
        return res.status(201).json({ message: 'Subscribed successfully', subscription: sub });
    } catch (err) {
        next(err);
    }
};

export const unsubscribe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { endpoint } = req.body;
        await notificationsService.removeSubscription(userId, endpoint);
        logger.info({ userId }, 'Successfully unsubscribed user from web push notifications');
        return res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (err) {
        next(err);
    }
};

export const testSend = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const payload = {
            title: 'Test Streak Reminder 🚀',
            body: 'This is a test notification from Spendly! Your streaks are glowing.',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            url: '/'
        };
        const results = await notificationsService.dispatchNotificationToUser(userId, payload);
        return res.status(200).json({ message: 'Test notification dispatches completed', results });
    } catch (err) {
        next(err);
    }
};
