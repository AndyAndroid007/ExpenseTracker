import * as userService from '../services/users.js';

export const getUsers = async (req, res, next) => {
    try {
        const users = await userService.getUsers(req.user.userId);
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

export const createUser = async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
}