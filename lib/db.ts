import "server-only";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as { gentleHubPool?: Pool };

/** One shared connection pool per server instance (survives dev hot reloads). */
export const pool =
  globalForDb.gentleHubPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.gentleHubPool = pool;
