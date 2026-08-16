// Feature flag: Only enable database if DATABASE_URL is set and real
const DATABASE_URL = process.env.DATABASE_URL || '';
const IS_REAL_DATABASE = !!DATABASE_URL && !DATABASE_URL.includes('dummy');

let PrismaClientClass: any = null;


if (IS_REAL_DATABASE) {
  try {
    // @ts-ignore - Optional dynamic import when generated Prisma client is missing
    const prismaModule = await import('../../../src/generated/prisma/index.js').catch(() => null);
    if (prismaModule?.PrismaClient) {
      PrismaClientClass = prismaModule.PrismaClient;
    } else {
      console.log('[database] DATABASE_URL set, but generated Prisma client not found. Running in-memory (DB disabled).');
    }
  } catch {
    console.log('[database] Failed to load Prisma client. Running in-memory (DB disabled).');
  }
} else {
  console.log('[database] DATABASE_URL not configured. Database persistence disabled.');
}

// Singleton pattern for Prisma Client
const globalForPrisma = global as unknown as { prisma: any | null };

export const prisma = (IS_REAL_DATABASE && PrismaClientClass)
  ? (globalForPrisma.prisma ||
    new PrismaClientClass({
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
  return !!prisma;
}

// Helper for safe database calls
export function withDatabase<T>(fn: (prisma: any) => Promise<T>): Promise<T | null> {
  if (!prisma) {
    console.warn('[database] Database not enabled, skipping operation');
    return Promise.resolve(null);
  }
  return fn(prisma);
}
