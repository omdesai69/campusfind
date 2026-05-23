import { migrate } from 'drizzle-orm/pglite/migrator';
import { getDb } from '../api/queries/connection';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  console.log("Starting migrations...");
  const db = getDb();
  const migrationsFolder = path.join(process.cwd(), 'db', 'migrations');
  
  if (!fs.existsSync(migrationsFolder)) {
    console.log("No migrations folder found. Please run 'npm run db:generate' first.");
    process.exit(1);
  }

  try {
    await migrate(db, { migrationsFolder });
    console.log("Migrations successfully applied to PGLite database.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
