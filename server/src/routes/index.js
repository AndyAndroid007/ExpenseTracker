import express from 'express';
import entriesRouter from './entries.js';
import usersRouter from './users.js';
import authRouter from './auth.js';
const router = express.Router();

router.use('/entries',entriesRouter);
router.use('/users',usersRouter);
router.use('/auth',authRouter);

export default router;