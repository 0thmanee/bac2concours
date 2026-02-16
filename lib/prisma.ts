import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create connection pool
const pool =
  globalForPrisma.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

/**
 * In dev, if the cached client is missing a model delegate (e.g. Next.js
 * loaded a stale Prisma client), clear the require cache and create a new
 * instance from the current generated client.
 */
function ensureClientHasAllModels(client: PrismaClient): PrismaClient {
  if (process.env.NODE_ENV === "production") return client;
  if (
    typeof (client as { announcement?: unknown }).announcement !== "undefined"
  )
    return client;

  try {
    (client as { $disconnect?: () => Promise<void> }).$disconnect?.();
  } catch {
    // ignore
  }
  globalForPrisma.prisma = undefined;
  try {
    delete require.cache[require.resolve("@prisma/client")];
    delete require.cache[require.resolve(".prisma/client")];
    const dotDefault = require.resolve(".prisma/client/default.js");
    delete require.cache[dotDefault];
  } catch {
    // ignore
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- intentional: re-load after cache clear so new models are present
  const { PrismaClient: FreshPrismaClient } = require("@prisma/client") as {
    PrismaClient: typeof PrismaClient;
  };
  return new FreshPrismaClient({ adapter });
}

const rawClient = globalForPrisma.prisma ?? new PrismaClient({ adapter });
export const prisma = ensureClientHasAllModels(rawClient);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;
