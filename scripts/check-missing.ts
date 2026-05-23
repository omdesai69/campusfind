import * as schema from "../db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";
import fs from "fs";
import path from "path";

const postgresClient = postgres(process.env.POSTGRES_URL || "", { max: 1 });
const db = drizzle(postgresClient, { schema });

async function run() {
  const allColleges = await db.select().from(schema.colleges);
  
  const missing = allColleges.filter(r => {
    if (!r.imageUrl) return true;
    const filePath = path.join(process.cwd(), "public", r.imageUrl);
    return !fs.existsSync(filePath);
  });
  
  console.log(`Missing ${missing.length} out of ${allColleges.length} images.`);
  missing.slice(0, 10).forEach(m => console.log(m.name, m.imageUrl));
  process.exit(0);
}

run();
