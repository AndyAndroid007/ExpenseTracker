import * as userRepository from '../repositories/users.js';
import ApiError from '../exceptions/ApiError.js';
import logger from '../utils/logger.js';

export const getUsers = async (userId) => {
    try {
        logger.trace({ userId }, 'Service getUsers started');
        const users = await userRepository.getUsers(userId);
        logger.debug({ count: users.length }, 'Successfully fetched users from repository');
        return users;
    } catch (err) {
        logger.error({ err, userId }, 'Error in getUsers service');
        throw new ApiError(400, err.message)
    };
};

export const getUserById = async (userId) => {
    try {
        logger.trace({ userId }, 'Service getUserById started');
        const user = await userRepository.getUserById(userId);
        logger.debug({ userId, found: !!user }, 'User query complete in repository');
        return user;
    } catch (err) {
        logger.error({ err, userId }, 'Error in getUserById service');
        throw new ApiError(400, err.message);
    }
};

export const getUserByEmail = async (email) => {
    try {
        logger.trace({ email }, 'Service getUserByEmail started');
        const user = await userRepository.getUserByEmail(email);
        logger.debug({ email, found: !!user }, 'User email query complete in repository');
        return user;
    } catch (err) {
        logger.error({ err, email }, 'Error in getUserByEmail service');
        throw new ApiError(400, err.message);
    }
};

export const createUser = async (newUser) => {
    try {
        logger.trace({ email: newUser?.email }, 'Service createUser started');
        const user = await userRepository.createUser(newUser);
        logger.info({ userId: user.id }, 'Successfully created user in repository');
        return user;
    } catch (err) {
        logger.error({ err, email: newUser?.email }, 'Error in createUser service');
        throw new ApiError(400, err.message);
    }
};

export const updateUser = async (user) => {
    try {
        logger.trace({ userId: user.id }, 'Service updateUser started');
        const existingUser = await userRepository.getUserById(user.id);

        const userAlreadyExists = await userRepository.getUserByEmail(user.email);

        if(userAlreadyExists) {
            logger.warn({ userId: user.id, duplicateEmail: user.email }, 'Attempted to use already registered email in update');
            throw new ApiError(409, 'This email is already associated with another user');
        };

        if (!existingUser) {
            logger.warn({ userId: user.id }, 'User profile not found for update');
            throw new ApiError(404, 'User not found');
        }
        if (user.name == null || user.name.trim() === '') {
            throw new ApiError(400, 'Name is required');
        }
        if (user.email == null || user.email.trim() === '' || !user.email.includes('@')) {
            throw new ApiError(400, 'Invalid email address');
        }
        if (user.password == null || user.password.trim() === '') {
            throw new ApiError(400, 'Password is required');
        }
        
        existingUser.name = user.name;
        existingUser.email = user.email;
        existingUser.password = user.password;
        
        const updated = await userRepository.updateUser(user.id, existingUser);
        logger.info({ userId: user.id }, 'Successfully updated user profile in repository');
        return updated;
    } catch (err) {
        logger.error({ err, userId: user.id }, 'Error in updateUser service');
        throw new ApiError(400, err.message);
    }
};