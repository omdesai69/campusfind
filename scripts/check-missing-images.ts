import { getDb } from '../server/queries/connection';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

async function run() {
  const db = getDb();
  const res = await db.execute(sql`SELECT slug, name, image_url FROM colleges WHERE image_url IS NULL OR image_url LIKE '%placeholder%' OR image_url = ''`);
  console.log('Missing images:', res);
  process.exit(0);
}
run();
