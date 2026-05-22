import * as authService from '../services/auth.js';

export const login = async (req, res, next) => {
    try {
        const {token, user} = await authService.login({email: req.body.email, password: req.body.password}); 
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 1 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        });
        return res.status(200).json({user});
    } catch (err) {
        next(err);
    }
};

export const register = async (req, res, next) => {
    try {
        const userId = req.user?.id || null;
        const {token,user} = await authService.register({userId, email: req.body.email, name: req.body.name, password: req.body.password});
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 1 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        });
        return res.status(201).json({user});
    } catch (err) {
        next(err);
    }
};

export const anonymousLogin = async (req, res, next) => {
    try {
        const {token, user} = await authService.anonymousLogin();
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({user});
    } catch (err) {
        next(err);  
    }
};