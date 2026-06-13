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

export const findConfirmCardMessage = async (userId, entryId) => {
    const messages = await prisma.chatMessage.findMany({
        where: {
            userId,
            type: 'confirm_card'
        }
    });
    return messages.find(m => m.payload && typeof m.payload === 'object' && m.payload.id === entryId);
};
