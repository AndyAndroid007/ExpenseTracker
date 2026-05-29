import prisma from '../lib/db.js'

export const createEntry = async (entryData) => {
    return await prisma.entry.create({
        data: entryData
    });
};

export const fetchEntriesByUser = async (userId, {from, to, limit, offset} = {}) => {
    const where = {
        userId: userId,
        isDeleted: false
    };
    
    if (from || to) {
        where.expenseDate = {};
    }

    if (from) {
        where.expenseDate.gte = new Date(`${from}T00:00:00.000Z`);
    }

    if (to) {
        where.expenseDate.lte = new Date(`${to}T00:00:00.000Z`);
    }
    return await prisma.entry.findMany({
        where: where,
        orderBy: {
            expenseDate: 'desc'
        },
        take: limit,
        skip: offset
    });
};

export const fetchEntryById = async (userId, entryId) => {
    return await prisma.entry.findFirst({
        where: {
            userId: userId,
            id: entryId,
            isDeleted: false
        }
    });
};

export const patchEntry = async (userId, entryId, patchedEntry) => {
    const entry = await fetchEntryById(userId, entryId);
    if (!entry) {
        throw new Error('Entry not found or unauthorized');
    }
    return await prisma.entry.update({
        where: {
            id: entryId,
            //userId: userId
        },
        data: patchedEntry
    });
};

export const deleteEntry = async (userId, entryId) => {
    const entry = await fetchEntryById(userId, entryId);
    if (!entry) {
        throw new Error('Entry not found or unauthorized');
    }
    return await prisma.entry.update({
        where: {
        id: entryId,
        //userId: userId
        },
        data: {isDeleted: true}
    });
};

