import prisma from '../lib/db.js';

export const getStreakByUserId = async (userId) => {
    return prisma.streak.findUnique({
        where: {
            userId: userId
        },
        select: {
            currentStreak: true,
            longestStreak: true,
            lastLoggedDate: true
        }
    });
}

export const updateStreak = async (userId, {currentStreak, lastLoggedDate}) => {
    let lastLoggedDateAsDate = null;

    if (lastLoggedDate) {
        lastLoggedDateAsDate = lastLoggedDate instanceof Date ? lastLoggedDate : new Date(`${lastLoggedDate}T00:00:00.000Z`);
    }
    return prisma.streak.update({
        where: {userId: userId},
        data: {
            currentStreak,
            lastLoggedDate: lastLoggedDateAsDate
        }
    })
};