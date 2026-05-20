import * as userService from '../services/users.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../exceptions/ApiError.js';

export const login = async ({ email, password }) => {
    const user = await userService.getUserByEmail(email);
    if (!user) {
        throw new ApiError(401, "The provided credentials are wrong.");
    };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "The provided credentials are wrong.");
    };

    const token = jwt.sign({
        userId: user.id,
    },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.expires_in || '1h'
        })

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    }
};

export const register = async ({ name, email, password }) => {
    const user = await userService.getUserByEmail(email);
    if (user) {
        throw new ApiError(409, "This email is already associated with another user");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await userService.createUser({ name, email, password: hashedPassword });

    const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.expires_in || '1h' }
    );

    return {
        token,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    }
}