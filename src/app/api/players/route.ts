import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const player = await request.json();
    const result = await query(
      `INSERT INTO players (id, name, roll, series, position, is_icon, status, goals_scored, assists, image_url, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, $8, $9)
       RETURNING id, name, roll, series, position, is_icon AS "isIcon", status,
                 goals_scored AS "goalsScored", assists, image_url AS "photoUrl", rating`,
      [player.id, player.name, player.roll, player.series, player.position, Boolean(player.isIcon), player.isIcon ? 'ICON' : 'AVAILABLE', player.photoUrl ?? null, player.rating ?? null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Player creation failed:', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to create player' }, { status: 400 });
  }
}