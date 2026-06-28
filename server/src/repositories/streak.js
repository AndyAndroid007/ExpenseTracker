import prisma from '../lib/db.js';

export const getStreakByUserId = async (userId) => {
    return prisma.streak.findUnique({
        where: {
            userId: userId
        },
        select: {
            currentStreak: true,
            longestStreak: true,
            lastLoggedDate: true,
            freezesAvailable: true,
            lastFreezeUsedAt: true,
        }
    });
}

export const updateStreak = async (userId, {currentStreak, lastLoggedDate, freezesAvailable, lastFreezeUsedAt}) => {
    let lastLoggedDateAsDate = null;

    

    if (lastLoggedDate) {
        lastLoggedDateAsDate = lastLoggedDate instanceof Date ? lastLoggedDate : new Date(`${lastLoggedDate}T00:00:00.000Z`);
    }

    const updateData = {currentStreak, lastLoggedDate: lastLoggedDateAsDate}

    if (freezesAvailable !== undefined) {
        updateData.freezesAvailable = freezesAvailable
    }

    if (lastFreezeUsedAt !== undefined) {
        updateData.lastFreezeUsedAt = lastFreezeUsedAt
    }
    
    return prisma.streak.update({
        where: {userId: userId},
        data: updateData
    })
};