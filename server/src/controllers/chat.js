import * as chatService from '../services/chat.js';
import logger from '../utils/logger.js';

export const getChatMessages = async (req, res, next) => {
    try {
        const userId = req.user.id;
        logger.debug({ userId }, 'Controller getChatMessages incoming request');
        const messages = await chatService.getChatMessages(userId);
        res.status(200).json(messages);
    } catch (err) {
        logger.error({ err, userId: req.user?.id }, 'Failed to fetch chat messages in controller');
        next(err);
    }
};
