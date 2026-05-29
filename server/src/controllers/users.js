import * as userService from '../services/users.js';
import logger from '../utils/logger.js';

export const getUsers = async (req, res, next) => {
    try {
        const requesterId = req.user.id;
        logger.debug({ requesterId }, 'Request to fetch all users entered controller');
        
        const users = await userService.getUsers(requesterId);
        
        logger.info({ requesterId, count: users.length }, 'Successfully retrieved users list');
        res.status(200).json(users);
    } catch (err) {
        logger.error({ err, requesterId: req.user.id }, 'Failed to retrieve users in controller');
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const requesterId = req.user.id;
        logger.debug({ requesterId, targetUserId }, 'Request to fetch user by ID entered controller');
        
        const user = await userService.getUserById(targetUserId);
        
        logger.info({ requesterId, targetUserId }, 'Successfully retrieved user details');
        res.status(200).json(user);
    } catch (err) {
        logger.error({ err, requesterId: req.user.id, targetUserId: req.params.id }, 'Failed to fetch user by ID in controller');
        next(err);
    }
}

export const createUser = async (req, res, next) => {
    try {
        logger.info({ email: req.body.email }, 'Request to create new user entered controller');
        
        const newUser = await userService.createUser(req.body);
        
        logger.info({ userId: newUser.id }, 'Successfully created new user record');
        res.status(201).json(newUser);
    } catch (err) {
        logger.error({ err, email: req.body.email }, 'Failed to create user in controller');
        next(err);
    }
}