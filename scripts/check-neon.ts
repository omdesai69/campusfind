import postgres from 'postgres';

async function run() {
  const sql = postgres('postgresql://neondb_owner:npg_ocEqmdkT98bC@ep-patient-flower-ap9m1hxx-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require');
  const res = await sql`UPDATE colleges SET image_url = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1000' WHERE name ILIKE '%MDI Gurgaon%' RETURNING name, image_url`;
  console.log('Update Result:', res);
  process.exit(0);
}
run();
