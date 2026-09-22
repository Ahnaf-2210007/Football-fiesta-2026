import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const validPositions = new Set(['FORWARD', 'MIDFIELDER', 'DEFENDER', 'GOALKEEPER']);

export async function POST(request: Request) {
  const client = await (await import('@/lib/db')).pool?.connect();
  if (!client) {
    return NextResponse.json({ message: 'DATABASE_URL is not configured' }, { status: 503 });
  }

  try {
    const { players, replace = false } = await request.json();
    if (!Array.isArray(players)) {
      return NextResponse.json({ message: 'players must be an array' }, { status: 400 });
    }

    await client.query('BEGIN');
    if (replace) {
      await client.query("DELETE FROM players WHERE is_icon = false");
    }

    for (const player of players) {
      const position = String(player.position || 'FORWARD').toUpperCase();
      if (!player.id || !player.name || !player.roll || !player.series || !validPositions.has(position)) {
        throw new Error(`Invalid player row: ${player.name || player.id || 'unknown'}`);
      }

      await client.query(
        `INSERT INTO players (id, name, roll, series, position, is_icon, status, sold_price,
          goals_scored, assists, image_url, drive_file_id, rating)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, roll = EXCLUDED.roll,
          series = EXCLUDED.series, position = EXCLUDED.position, is_icon = EXCLUDED.is_icon,
          status = EXCLUDED.status, image_url = EXCLUDED.image_url,
          drive_file_id = EXCLUDED.drive_file_id, rating = EXCLUDED.rating,
          updated_at = now()`,
        [player.id, player.name, player.roll, player.series, position, Boolean(player.isIcon), player.isIcon ? 'ICON' : (player.status || 'AVAILABLE'), player.soldPrice ?? null, player.goalsScored ?? 0, player.assists ?? 0, player.photoUrl ?? null, player.driveFileId ?? null, player.rating ?? null]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ imported: players.length });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Player import failed:', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Import failed' }, { status: 400 });
  } finally {
    client.release();
  }
}
