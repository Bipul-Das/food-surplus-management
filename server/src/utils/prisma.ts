// server/src/utils/prisma.ts

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// 1. Initialize the native pg connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Create the Prisma adapter instance
const adapter = new PrismaPg(pool);

// 3. Global pattern to prevent connection pool exhaustion in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 4. Instantiate PrismaClient with the adapter
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter, // Required in Prisma 7
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;