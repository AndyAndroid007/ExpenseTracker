import * as userService from '../services/users.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../exceptions/ApiError.js';
import logger from '../utils/logger.js';

export const login = async ({ email, password }) => {
    logger.trace({ email }, 'Service login started');
    const user = await userService.getUserByEmail(email);
    if (!user) {
        logger.warn({ email }, 'Login failed: email not found in database');
        throw new ApiError(401, "The provided credentials are wrong.");
    };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        logger.warn({ email }, 'Login failed: invalid password matching');
        throw new ApiError(401, "The provided credentials are wrong.");
    };

    logger.debug({ userId: user.id }, 'Credentials verified successfully, signing JWT session token');
    const token = jwt.sign({
        userId: user.id,
    },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.expires_in || '1d'
        })

    logger.info({ userId: user.id }, 'JWT token signed successfully for standard login session');
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAnonymous: false
        }
    }
};

export const register = async ({ userId = null, name, email, password }) => {
    logger.trace({ email, upgradeUserId: userId }, 'Service register started');
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
        logger.warn({ email }, 'Registration failed: email already registered in database');
        throw new ApiError(409, "This email is already associated with another user");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let registerUser;
    if (userId) {
        logger.debug({ userId }, 'Upgrading anonymous guest session profile to standard account');
        const user = await userService.getUserById(userId);
        if (!user) {
            logger.warn({ userId }, 'Upgrade failed: anonymous user record not found in database');
            throw new ApiError(404, 'User not found.');
        }

        registerUser = await userService.updateUser({ id: userId, name, email, password: hashedPassword });
        logger.info({ userId: registerUser.id }, 'Anonymous profile upgraded to registered account successfully');
    }
    else {
        logger.debug('Creating brand new user profile database record');
        registerUser = await userService.createUser({ name, email, password: hashedPassword });
        logger.info({ userId: registerUser.id }, 'Brand new registered account profile created successfully');
    }

    logger.debug({ userId: registerUser.id }, 'Signing JWT session token for registered user');
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

export const anonymousLogin = async (guestUserId = null) => {
    logger.trace({ guestUserId }, 'Service anonymousLogin triggered, generating guest profile');
    let targetUser = null;
    if (guestUserId) {
        try {
            const user = await userService.getUserById(guestUserId);
            if (user && user.email === null) {
                targetUser = user;
                logger.info({ userId: targetUser.id }, 'Reusing existing anonymous guest user profile');
            }
        } catch (err) {
            logger.warn({ guestUserId, err }, 'Failed to retrieve guest user to reuse, creating a new user');
        }
    }

    if (!targetUser) {
        targetUser = await userService.createUser();
        logger.debug({ userId: targetUser.id }, 'New anonymous guest profile generated successfully');
    }

    logger.debug({ userId: targetUser.id }, 'Signing guest JWT session token');
    
    const token = jwt.sign({
        userId: targetUser.id,
        isAnonymous: true,
    }, process.env.JWT_SECRET,
        { expiresIn: process.env.anonymous_expires_in || '60d' })

    logger.info({ userId: targetUser.id }, 'Guest JWT token generated successfully for anonymous session');
    return {
        token,
        user: {
            id: targetUser.id,
            isAnonymous: true
        }
    }
}