import * as chatRepository from '../repositories/chat.js';
import logger from '../utils/logger.js';

export const getChatMessages = async (userId) => {
    logger.trace({ userId }, 'Service getChatMessages started');
    let messages = await chatRepository.fetchChatMessagesByUser(userId);
    
    if (messages.length === 0) {
        logger.info({ userId }, 'No chat history found, seeding default welcome message');
        const welcomeMessage = await chatRepository.createChatMessage({
            userId,
            sender: 'system',
            text: "Hey! 👋 I'm Spendly. Tell me what you spent today, or say 'no spend' if you didn't spend anything.",
            type: 'text'
        });
        messages = [welcomeMessage];
    }
    
    return messages;
};

export const saveMessage = async (userId, sender, text, type = 'text', payload = null) => {
    logger.trace({ userId, sender, type }, 'Service saveMessage started');
    return await chatRepository.createChatMessage({
        userId,
        sender,
        text,
        type,
        payload
    });
};
