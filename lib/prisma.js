import { PrismaClient } from '@prisma/client';

// Use a Proxy so PrismaClient is instantiated lazily — only on the first
// actual database call, not at module-import time. This prevents Vercel's
// build step from crashing when it loads the module without DATABASE_URL.

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new Proxy(
    {},
    {
      get(_, prop) {
        if (!globalForPrisma._prismaClient) {
          globalForPrisma._prismaClient = createPrismaClient();
        }
        const client = globalForPrisma._prismaClient;
        const value = client[prop];
        return typeof value === 'function' ? value.bind(client) : value;
      },
    }
  );

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
