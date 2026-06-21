import prisma from '../lib/db.js';

export const aggregatePeriodData = async (userId, from, to) => {
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T00:00:00.000Z`);

    // Run all database-level counts and aggregations in parallel!
    const [totalLogs, categorySums, noSpendDays, saveDays] = await Promise.all([
        // 1. Total entry count
        prisma.entry.count({
            where: {
                userId,
                isDeleted: false,
                expenseDate: { gte: fromDate, lte: toDate }
            }
        }),

        // 2. Group by + Sum spent
        prisma.entry.groupBy({
            by: ['category'],
            where: {
                userId,
                type: 'expense',
                isDeleted: false,
                expenseDate: { gte: fromDate, lte: toDate }
            },
            _sum: {
                amount: true
            }
        }),

        // 3. PostgreSQL DISTINCT select of unique no-spend days (save_day with null amount)
        prisma.entry.findMany({
            where: {
                userId,
                type: 'save_day',
                amount: null,
                isDeleted: false,
                expenseDate: { gte: fromDate, lte: toDate }
            },
            select: { expenseDate: true },
            distinct: ['expenseDate']
        }),

        // 4. PostgreSQL DISTINCT select of unique save-day days (save_day with non-null amount)
        prisma.entry.findMany({
            where: {
                userId,
                type: 'save_day',
                amount: { not: null },
                isDeleted: false,
                expenseDate: { gte: fromDate, lte: toDate }
            },
            select: { expenseDate: true },
            distinct: ['expenseDate']
        })
    ]);

    return {
        totalLogs,
        categorySums,
        noSpendDaysCount: noSpendDays.length,
        saveDaysCount: saveDays.length
    };
};

