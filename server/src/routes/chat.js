import express from 'express';
import * as chatController from '../controllers/chat.js';
import { auth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', auth, chatController.getChatMessages);

export default router;
