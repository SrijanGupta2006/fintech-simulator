// Now, whenever you want to check a user's wallet or execute a trade anywhere in your app, you will simply write import { prisma } from "@/lib/prisma" and make the call safely. Otherwise If we instantiate the client inside our functions, we will exhaust those connections in seconds, and PostgreSQL will aggressively shut down, throwing a "Too many connections" error.

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// We wrap the instantiation in a function to cleanly build the adapter
const createPrismaClient = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;