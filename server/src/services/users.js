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
        //Anonymous Login is implemented, so email and password are not required
        // if(!newUser.email || !newUser.password){
        //     throw new ApiError(400, 'Email and password are required');
        // }
        const user = await userRepository.createUser(newUser);
        return user;
    } catch (err) {
        throw new ApiError(400, err.message);
    }
};

export const updateUser = async (user) => {
    try {
        const existingUser = await userRepository.getUserById(user.id);

        const userAlreadyExists = await userRepository.getUserByEmail(user.email);

        if(userAlreadyExists) {
            throw new ApiError(409, 'This email is already associated with another user');
        };

        if (!existingUser) {
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
        return await userRepository.updateUser(user.id, existingUser);
    } catch (err) {
        throw new ApiError(400, err.message);
    }
};