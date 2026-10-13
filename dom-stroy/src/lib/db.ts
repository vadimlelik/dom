import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const make = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? make();
if (process.env.NODE_ENV !== 'production') g.prisma = db;
