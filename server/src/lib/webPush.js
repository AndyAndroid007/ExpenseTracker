import webPush from 'web-push';
import logger from '../utils/logger.js';

let publicKey = process.env.VAPID_PUBLIC_KEY;
let privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
    logger.warn('VAPID keys not found in environment. Auto-generating development VAPID keypair');
    const autoKeys = webPush.generateVAPIDKeys();
    publicKey = autoKeys.publicKey;
    privateKey = autoKeys.privateKey;
}

try {
    webPush.setVapidDetails(
        'mailto:' + (process.env.WEB_PUSH_CONTACT || 'support@expensetrack.app'),
        publicKey,
        privateKey
    );
} catch (err) {
    logger.error({ err }, 'Failed to configure Web Push VAPID details');
}

export const getVapidPublicKey = () => publicKey;

export const sendPushNotification = async (subscription, payload) => {
    try {
        const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
        return await webPush.sendNotification(subscription, payloadStr);
    } catch (err) {
        logger.error({err, subscriptionEndpoint: subscription.endpoint}, 'Failed to dispatch Web Push notification');
        throw err;
    }
}

export default {getVapidPublicKey, sendPushNotification};