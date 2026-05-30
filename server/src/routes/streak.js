import express from 'express';
import {auth} from '../middlewares/authMiddleware.js';
import * as streakController from '../controllers/streak.js';

const router = express.Router();

router.get('/', auth, streakController.getStreaks);
export default router;