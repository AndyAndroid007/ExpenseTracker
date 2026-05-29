import express from 'express';
const router = express.Router();
import * as entriesController from '../controllers/entries.js'
import { auth } from '../middlewares/authMiddleware.js'

router.get("/", auth, entriesController.getEntries);
router.post("/", auth, entriesController.postEntry);
router.patch("/:id", auth, entriesController.patchEntry);
router.delete("/:id", auth, entriesController.deleteEntry);

export default router;