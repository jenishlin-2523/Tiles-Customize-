import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";

// Use absolute path for local db to ensure consistency
const dbPath = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "local.db")}`;

const client = createClient({
  url: dbPath,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export * from "./schema";
