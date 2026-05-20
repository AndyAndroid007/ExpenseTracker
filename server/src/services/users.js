import * as userRepository from '../repositories/users.js';
import ApiError from '../exceptions/ApiError.js';
export const getUsers = async (userId) => {
    try {
        const users = await userRepository.getUsers(userId);
        return users;
    } catch (err) {
        throw new ApiError(400, err.message)
    };
};

export const getUserById = async (userId) => {
    try {
        const user = await userRepository.getUserById(userId);
        return user;
    } catch (err) {
        throw new ApiError(400, err.message);
    }
};

export const getUserByEmail = async (email) => {
    try {
        const user = await userRepository.getUserByEmail(email);
        return user;
    } catch (err) {
        throw new ApiError(400, err.message);
    }
};

export const createUser = async (newUser) => {
    try {
        if(!newUser.email || !newUser.password){
            throw new ApiError(400, 'Email and password are required');
        }
        const user = await userRepository.createUser(newUser);
        return user;
    } catch (err) {
        throw new ApiError(400, err.message);
    }
};