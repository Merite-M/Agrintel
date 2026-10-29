import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL || "postgresql://mock_user:mock_password@ep-mock.neon.tech/mock_db";

if (!process.env.DATABASE_URL && typeof window === "undefined" && process.env.NODE_ENV === "production" && process.env.NEXT_RUNTIME) {
  console.warn(
    "Warning: DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
  );
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
export { schema };
