import dns from 'node:dns';
import { PrismaClient } from '@prisma/client';

dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

export default prisma;