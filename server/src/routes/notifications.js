import express from 'express';
import { auth } from '../middlewares/authMiddleware.js';
import * as notificationsController from '../controllers/notifications.js';

const router = express.Router();

router.get('/vapid-public-key', notificationsController.getVapidKey);
router.post('/subscribe', auth, notificationsController.subscribe);
router.post('/unsubscribe', auth, notificationsController.unsubscribe);
router.post('/test-send', auth, notificationsController.testSend);

export default router;
