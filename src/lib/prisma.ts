import { PrismaClient } from '@prisma/client';

// In serverless environments (Vercel), each function invocation may create a
// new module instance. We cache the client on globalThis in development to
// avoid exhausting connections during hot-reload, and rely on the
// connection_limit=1 query param in production to keep pool usage minimal.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Datasource URL is read from DATABASE_URL env var automatically.
    // connection_limit=1 is set in the URL for serverless compatibility.
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

// Only cache on globalThis in development (hot-reload safe).
// In production (serverless) we intentionally do NOT cache so each
// cold-start gets a fresh client — connection_limit=1 keeps it safe.
if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}
