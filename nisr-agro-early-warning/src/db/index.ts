import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon pooled connection string.",
  );
}

// Neon's HTTP driver suits serverless functions on Vercel: no persistent connections,
// fast cold starts, and it works well with Neon's free tier that suspends when idle.
// Note: the HTTP driver does not support interactive transactions. Bulk imports that
// need all-or-nothing writes should use a batch statement or the Python pipeline.
const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
export { schema };
