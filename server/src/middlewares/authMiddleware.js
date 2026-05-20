import ApiError from '../exceptions/ApiError.js';
import {getUserById} from '../services/users.js';
import jwt from 'jsonwebtoken';
export const auth = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1];
        }
        else if (req.query.token) {
            token = req.query.token;
        }

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