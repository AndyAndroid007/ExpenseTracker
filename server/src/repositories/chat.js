import prisma from '../lib/db.js';

export const fetchChatMessagesByUser = async (userId) => {
    return await prisma.chatMessage.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
};

export const createChatMessage = async (data) => {
    return await prisma.chatMessage.create({
        data
    });
};

export const updateChatMessage = async (messageId, data) => {
    return await prisma.chatMessage.update({
        where: {
            id: messageId
        },
        data
    });
};

/**
 * PERFORMANCE DECISION:
 * Direct PostgreSQL JSONB path filtering `payload: { path: ['id'], equals: entryId }`.
 * Avoids loading the entire historical list of user confirmation messages into Node.js
 * memory and running an in-memory `.find()`, which causes heavy network transfer and CPU
 * bloat as chat history expands.
 */
export const findConfirmCardMessage = async (userId, entryId) => {
    return await prisma.chatMessage.findFirst({
        where: {
            userId,
            type: 'confirm_card',
            payload: {
                path: ['id'],
                equals: entryId
            }
        }
    });
};
