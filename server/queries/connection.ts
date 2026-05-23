import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let client: ReturnType<typeof postgres>;

export function getDb() {
  if (!instance) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error("Missing database connection string. Set POSTGRES_URL or DATABASE_URL in your environment.");
    }

    client = postgres(connectionString, { prepare: false });
    instance = drizzle(client, {
      schema: fullSchema,
    });
  }
  return instance;
}
