import { PrismaClient } from '../../../src/generated/prisma/index.js';

// Feature flag: Only enable database if DATABASE_URL is set
// Falls back to dummy URL for builds (Prisma client generation)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
const IS_REAL_DATABASE = !!process.env.DATABASE_URL && !DATABASE_URL.includes('dummy');

// Singleton pattern for Prisma Client
// Prevents creating multiple instances in development (hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

export const prisma = IS_REAL_DATABASE
  ? (globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    }))
  : null;

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Helper to check if database is enabled
export function isDatabaseEnabled(): boolean {
  return IS_REAL_DATABASE;
}

// Helper for safe database calls
export function withDatabase<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T | null> {
  if (!prisma) {
    console.warn('[database] Database not enabled, skipping operation');
    return Promise.resolve(null);
  }
  return fn(prisma);
}
