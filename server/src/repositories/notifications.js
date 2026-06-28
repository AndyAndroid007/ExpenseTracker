import prisma from '../lib/db.js';

export const upsertSubscription = async (userId, { endpoint, p256dh, auth }) => {
    return prisma.pushSubscription.upsert({
        where: { endpoint },
        create: { userId, endpoint, p256dh, auth },
        update: { userId, p256dh, auth }
    });
};

export const deleteSubscription = async (endpoint) => {
    return prisma.pushSubscription.deleteMany({
        where: { endpoint }
    });
};

export const getSubscriptionsByUserId = async (userId) => {
    return prisma.pushSubscription.findMany({
        where: { userId }
    });
};

export const getAllSubscriptions = async () => {
    return prisma.pushSubscription.findMany({
        include: { user: true }
    });
};
