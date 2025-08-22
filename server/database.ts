import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Use environment variable for database connection
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres connection
const sql = postgres(databaseUrl, { prepare: false });

// Create drizzle database instance
export const db = drizzle(sql, { schema });