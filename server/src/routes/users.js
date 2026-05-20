import express from 'express';
import * as userController from '../controllers/users.js';
import {auth} from '../middlewares/authMiddleware.js';
const router = express.Router();


router.get('/',auth,userController.getUsers);
router.get('/:id',auth,userController.getUserById);
router.post('/',userController.createUser);

export default router;
