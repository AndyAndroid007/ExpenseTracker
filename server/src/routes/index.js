import express from 'express';
import entriesRouter from './entries.js';
import usersRouter from './users.js';
import authRouter from './auth.js';
import streakRouter from './streak.js';
import insightsRouter from './insights.js';

const router = express.Router();

router.use('/entries', entriesRouter);
router.use('/users', usersRouter);
router.use('/auth', authRouter);
router.use('/streaks', streakRouter);
router.use('/insights', insightsRouter);

export default router;