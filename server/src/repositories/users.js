import prisma from '../lib/db.js';
export const getUserById = async (userId) => {
    let user;
    user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    return user;
};

export const getUsers = async (userId) => {
    return await prisma.user.findMany();
};

export const getUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {
            email: email
        }
    });
};

export const createUser = async (newUser) => {
    return await prisma.user.create({
        data: newUser
    });
};

