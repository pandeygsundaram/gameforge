import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
export async function initializeDB() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully via Prisma');
    }
    catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}
export async function disconnectDB() {
    await prisma.$disconnect();
}
