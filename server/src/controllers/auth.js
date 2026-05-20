import * as authService from '../services/auth.js';

export const login = async (req, res, next) => {
    try {
        const user = await authService.login({email: req.body.email, password: req.body.password}); 
        return res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

export const register = async (req, res, next) => {
    try {
        const newUser = await authService.register({email: req.body.email, name: req.body.name, password: req.body.password});
        return res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
};