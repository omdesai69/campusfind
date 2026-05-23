import fs from "fs";
import path from "path";
import * as schema from "../db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";
import { eq } from "drizzle-orm";

const sql = postgres(process.env.POSTGRES_URL || process.env.DATABASE_URL || "", { max: 1 });
const db = drizzle(sql, { schema });

async function run() {
  console.log("Checking DB against downloaded images...");
  const allColleges = await db.select().from(schema.colleges);
  const publicDir = path.join(process.cwd(), "public", "colleges");

  let updated = 0;
  for (const college of allColleges) {
    const imgPath = path.join(publicDir, `${college.slug}.jpg`);
    if (!fs.existsSync(imgPath)) {
      // Image missing, set DB imageUrl to null so it falls back to placeholder
      await db.update(schema.colleges)
        .set({ imageUrl: null })
        .where(eq(schema.colleges.id, college.id));
      updated++;
      console.log(`Missing image for ${college.name}. Updated DB to use fallback placeholder.`);
    } else {
      // Image exists, ensure DB points to it
      await db.update(schema.colleges)
        .set({ imageUrl: `/colleges/${college.slug}.jpg` })
        .where(eq(schema.colleges.id, college.id));
    }
  }

  console.log(`Finished. Updated ${updated} missing images to use fallback.`);
  process.exit(0);
}

run();
