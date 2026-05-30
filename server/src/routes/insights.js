import express from 'express';
import { auth } from '../middlewares/authMiddleware.js';
import * as insightsController from '../controllers/insights.js';

const router = express.Router();

router.get('/:period', auth, insightsController.getInsightsByPeriod);

export default router;