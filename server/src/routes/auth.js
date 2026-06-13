import express from 'express';
import * as authController from '../controllers/auth.js';
import validate from '../middlewares/validationMiddleware.js';
import { registerSchema, loginSchema } from '../models/user.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/anonymous', authController.anonymousLogin);
router.post('/login', validate(loginSchema), authController.login);
router.post('/register', optionalAuth, validate(registerSchema), authController.register);
router.post('/logout', authController.logout);

export default router;