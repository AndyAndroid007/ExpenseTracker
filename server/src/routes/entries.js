import express from 'express';
const router = express.Router();
import * as entriesController from '../controllers/entries.js'

router.get("/", entriesController.getEntries);
router.post("/",entriesController.postEntry);

export default router;