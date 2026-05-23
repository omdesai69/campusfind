import * as schema from "../db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";

const postgresClient = postgres(process.env.POSTGRES_URL || "", { max: 1 });
const db = drizzle(postgresClient, { schema });

async function run() {
  const colleges = await db.select().from(schema.colleges).limit(5);
  for (const c of colleges) {
    console.log(c.slug, c.imageUrl);
  }
  process.exit(0);
}

run();
