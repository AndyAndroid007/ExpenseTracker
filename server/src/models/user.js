import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(3, "Name should be atleast 3 characters long.").optional().nullable(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password should be atleast 6 characters long").optional().nullable(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});