import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  const payload = await request.json();
  const { action } = payload;

  try {
    if (action === 'markPlayerSold' || action === 'assignIconPlayer') {
      const { playerId, teamId, price } = payload;
      const client = await (await import('@/lib/db')).pool?.connect();
      if (!client) throw new Error('DATABASE_URL is not configured');
      try {
        await client.query('BEGIN');
        const playerResult = await client.query('SELECT * FROM players WHERE id = $1 FOR UPDATE', [playerId]);
        const teamResult = await client.query('SELECT * FROM teams WHERE id = $1 FOR UPDATE', [teamId]);
        const player = playerResult.rows[0];
        const team = teamResult.rows[0];
        if (!player || !team) throw new Error('Player or team not found');
        if (action === 'markPlayerSold' && player.status !== 'AVAILABLE') throw new Error('Player is no longer available');
        const squadResult = await client.query('SELECT COUNT(*)::int AS count FROM players WHERE team_id = $1', [teamId]);
        if (squadResult.rows[0].count >= team.max_squad_size) throw new Error('Team squad limit reached');
        const spentResult = await client.query('SELECT COALESCE(SUM(price), 0)::int AS spent FROM auction_sales WHERE team_id = $1', [teamId]);
        if (spentResult.rows[0].spent + Number(price) > team.starting_purse) throw new Error('Team budget exceeded');
        await client.query("UPDATE players SET status = $1, is_icon = $2, sold_price = $3, team_id = $4, updated_at = now() WHERE id = $5", [action === 'assignIconPlayer' ? 'ICON' : 'SOLD', action === 'assignIconPlayer', price, teamId, playerId]);
        await client.query('INSERT INTO auction_sales (player_id, team_id, price, is_icon_sale) VALUES ($1, $2, $3, $4) ON CONFLICT (player_id) DO UPDATE SET team_id = EXCLUDED.team_id, price = EXCLUDED.price, is_icon_sale = EXCLUDED.is_icon_sale', [playerId, teamId, price, action === 'assignIconPlayer']);
        await client.query('COMMIT');
        return NextResponse.json({ ok: true });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    if (action === 'markPlayerUnsold') {
      await query("UPDATE players SET status = 'UNSOLD', team_id = NULL, sold_price = NULL, updated_at = now() WHERE id = $1", [payload.playerId]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'incrementPlayerGoals') {
      await query('UPDATE players SET goals_scored = GREATEST(0, goals_scored + $2), updated_at = now() WHERE id = $1', [payload.playerId, payload.delta]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'updatePlayer') {
      const p = payload.player;
      await query('UPDATE players SET name=$2, roll=$3, series=$4, position=$5, image_url=$6, rating=$7, assists=$8, updated_at=now() WHERE id=$1', [p.id, p.name, p.roll, p.series, p.position, p.photoUrl ?? null, p.rating ?? null, p.assists ?? 0]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'updateTeam') {
      const t = payload.team;
      const team = await query<{ owner_id: string | null }>('SELECT owner_id FROM teams WHERE id = $1', [t.id]);
      let ownerId = team.rows[0]?.owner_id;
      if (ownerId) {
        await query('UPDATE team_owners SET name=$2, image_url=$3, updated_at=now() WHERE id=$1', [ownerId, t.owner, t.ownerPhotoUrl ?? null]);
      } else {
        const owner = await query<{ id: string }>('INSERT INTO team_owners (name, image_url) VALUES ($1, $2) RETURNING id', [t.owner, t.ownerPhotoUrl ?? null]);
        ownerId = owner.rows[0].id;
      }
      await query(`
        INSERT INTO teams (id, name, short_name, logo_url, color, starting_purse, max_squad_size, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET name=$2, short_name=$3, logo_url=$4, color=$5,
          starting_purse=$6, max_squad_size=$7, owner_id=$8, updated_at=now()
      `, [t.id, t.name || 'Unnamed Team', t.shortName || t.id.toUpperCase(), t.logoUrl ?? null, t.color || '#00B3A4', t.startingPurse ?? 1500, t.maxSquadSize ?? 10, ownerId]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'updateFixtureScore') {
      const f = payload.fixture;
      await query('UPDATE fixtures SET team1_score=$2, team2_score=$3, team1_pens=$4, team2_pens=$5, is_completed=$6, updated_at=now() WHERE id=$1', [f.id, f.team1Score ?? null, f.team2Score ?? null, f.team1Pens ?? null, f.team2Pens ?? null, f.team1Score !== undefined && f.team2Score !== undefined]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'performGroupDraw') {
      const teams = (await query<{ id: string; name: string }>('SELECT id, name FROM teams ORDER BY random()')).rows;
      if (teams.length < 6) throw new Error('Six teams are required for group draw');
      for (const [index, team] of teams.entries()) await query('UPDATE teams SET group_name=$2, updated_at=now() WHERE id=$1', [team.id, index < 3 ? 'A' : 'B']);
      const groupA = teams.slice(0, 3);
      const groupB = teams.slice(3, 6);
      const fixtures = [
        [1, 'A', groupA[0], groupA[1], 'Group A - Match 1'], [2, 'A', groupA[1], groupA[2], 'Group A - Match 2'], [3, 'A', groupA[2], groupA[0], 'Group A - Match 3'],
        [4, 'B', groupB[0], groupB[1], 'Group B - Match 1'], [5, 'B', groupB[1], groupB[2], 'Group B - Match 2'], [6, 'B', groupB[2], groupB[0], 'Group B - Match 3']
      ] as const;
      await query('DELETE FROM fixtures');
      for (const [matchNo, group, team1, team2, stageName] of fixtures) {
        await query('INSERT INTO fixtures (id, match_no, group_name, team1_id, team1_name, team2_id, team2_name, stage_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [`f-${matchNo}`, matchNo, group, team1.id, team1.name, team2.id, team2.name, stageName]);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'addRule' || action === 'updateRule') {
      const rule = payload.rule;
      await query('INSERT INTO tournament_rules (id, title, description, category, is_default) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, category=EXCLUDED.category, is_default=EXCLUDED.is_default, updated_at=now()', [rule.id, rule.title, rule.description, rule.category, rule.isDefault ?? false]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'deleteRule') {
      await query('DELETE FROM tournament_rules WHERE id = $1', [payload.ruleId]);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error(`Mutation ${action} failed:`, error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Mutation failed' }, { status: 400 });
  }
}
