import * as authService from '../services/auth.js';
import logger from '../utils/logger.js';

export const login = async (req, res, next) => {
    try {
        logger.info({ email: req.body.email }, 'User login request entered controller');
        const {token, user} = await authService.login({email: req.body.email, password: req.body.password}); 
        
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 1 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        });
        
        logger.info({ userId: user.id }, 'User successfully logged in, session cookie set');
        return res.status(200).json({user});
    } catch (err) {
        logger.error({ err, email: req.body.email }, 'Failed login attempt in controller');
        next(err);
    }
};

export const register = async (req, res, next) => {
    try {
        const anonymousUserId = req.user?.id || null;
        logger.info({ email: req.body.email, anonymousUserId }, 'Register/Upgrade user request entered controller');
        
        const {token,user} = await authService.register({userId: anonymousUserId, email: req.body.email, name: req.body.name, password: req.body.password});
        
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 1 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        });
        
        logger.info({ userId: user.id, upgraded: !!anonymousUserId }, 'User registered/upgraded successfully, session cookie set');
        return res.status(201).json({user});
    } catch (err) {
        logger.error({ err, email: req.body.email }, 'Failed user registration in controller');
        next(err);
    }
};

export const anonymousLogin = async (req, res, next) => {
    try {
        const { guestUserId } = req.body || {};
        logger.info({ guestUserId }, 'Anonymous guest login request entered controller');
        const {token, user} = await authService.anonymousLogin(guestUserId);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 24 * 60 * 60 * 1000
        });
        
        logger.info({ userId: user.id }, 'Anonymous guest session created successfully, cookie set');
        return res.status(200).json({user});
    } catch (err) {
        logger.error({ err }, 'Failed anonymous guest login in controller');
        next(err);  
    }
};

export const logout = async (req, res, next) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        logger.info('User session cookie cleared on logout');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        logger.error({ err }, 'Failed to clear user cookie on logout');
        next(err);
    }
};