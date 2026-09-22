import { Pool, type QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var footballFiestaPool: Pool | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl
  ? globalThis.footballFiestaPool ?? new Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl: { rejectUnauthorized: false }
    })
  : null;

if (pool && process.env.NODE_ENV !== 'production') {
  globalThis.footballFiestaPool = pool;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured');
  }

  return pool.query<T>(text, values);
}