import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";

// LibSQL supports only: libsql:, file:, https:, http:, ws:, wss:
// PostgreSQL URLs are not supported - use Turso (libsql://) for production
const SUPPORTED_SCHEMES = ["libsql:", "file:", "https:", "http:", "ws:", "wss:"];
const rawUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "local.db")}`;
const isSupported = SUPPORTED_SCHEMES.some((s) => rawUrl.toLowerCase().startsWith(s));
// Use in-memory DB when DATABASE_URL is PostgreSQL (Vercel build) or other unsupported schemes
const dbPath = isSupported ? rawUrl : "file::memory:";

const client = createClient({
  url: dbPath,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export * from "./schema";
