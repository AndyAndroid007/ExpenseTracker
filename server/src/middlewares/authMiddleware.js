import ApiError from '../exceptions/ApiError.js';
import {getUserById} from '../services/users.js';
import jwt from 'jsonwebtoken';

const extractToken = (req) => {
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    };

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
        return authHeader.split(" ")[1];
    }
    if (req.query.token) {
        return req.query.token;
    }
    return null;
}
export const auth = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return next(new ApiError(401, "You are not authorized. Please login and try again."));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await getUserById(decoded.userId);

        if (!user) {
            return next(new ApiError(404, "User Not Found"));
        }

        req.user = user;

        return next();
    } catch (err) {
        if (err instanceof ApiError) {
            return next(err);
        }

        return next(new ApiError(401, "You are not authorized. Please login and try again."));
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if(token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await getUserById(decoded.userId);
            if(user) {
                req.user = user;
            }
        }
        return next();
    } catch (error) {
        return next();
    }
}