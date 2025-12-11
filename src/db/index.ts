import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Prevent initializing DB if URL is missing (build time check)
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode which is typical for serverless
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
