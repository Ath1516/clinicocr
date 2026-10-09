import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export const isDatabaseConnected = Boolean(
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith('postgres://') ||
   process.env.DATABASE_URL.startsWith('postgresql://')) &&
  !process.env.DATABASE_URL.includes('placeholder')
);

// If DATABASE_URL is not set or placeholder, use a dummy connection string that won't throw at import time
const connectionString = isDatabaseConnected
  ? process.env.DATABASE_URL!
  : 'postgresql://placeholder_user:placeholder_pass@ep-empty.us-east-2.aws.neon.tech/neondb';

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
