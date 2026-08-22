import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({
  client: sql,
});
export async function testDatabase() {
  const res = await sql`SELECT 1 AS connected`;
  return res;
}
