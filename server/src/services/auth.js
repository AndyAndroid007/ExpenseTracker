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
            expiresIn: process.env.expires_in || '1d'
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

export const register = async ({ userId = null, name, email, password }) => {
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
        throw new ApiError(409, "This email is already associated with another user");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let registerUser;
    if (userId) {
        const user = await userService.getUserById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found.');
        }

        registerUser = await userService.updateUser({ id: userId, name, email, password: hashedPassword });
    }
    else {
        registerUser = await userService.createUser({ name, email, password: hashedPassword });
    }

    const token = jwt.sign(
        { userId: registerUser.id, isAnonymous: false },
        process.env.JWT_SECRET,
        { expiresIn: process.env.expires_in || '1d' }
    );

    return {
        token,
        user: {
            id: registerUser.id,
            name: registerUser.name,
            email: registerUser.email,
            isAnonymous: false
        }
    }
};

export const anonymousLogin = async () => {
    const newUser = await userService.createUser();
    const token = jwt.sign({
        userId: newUser.id,
        isAnonymous: true,
    }, process.env.JWT_SECRET,
        { expiresIn: process.env.anonymous_expires_in || '60d' })

    return {
        token,
        user: {
            id: newUser.id,
            isAnonymous: true
        }
    }
}