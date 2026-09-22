import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  const payload = await request.json();
  const { action } = payload;

  try {
    if (action === 'markPlayerSold' || action === 'assignIconPlayer' || action === 'assignGoalkeeper') {
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
        if ((action === 'markPlayerSold' || action === 'assignGoalkeeper') && player.status !== 'AVAILABLE' && player.status !== 'UNSOLD' && player.status !== 'SOLD') throw new Error('Player is no longer available');
        await client.query('SELECT team_id, price FROM auction_sales WHERE player_id = $1 FOR UPDATE', [playerId]);
        const squadResult = await client.query('SELECT COUNT(*)::int AS count FROM players WHERE team_id = $1 AND id <> $2', [teamId, playerId]);
        if (squadResult.rows[0].count >= team.max_squad_size) throw new Error('Team squad limit reached');
        const spentResult = await client.query('SELECT COALESCE(SUM(price), 0)::int AS spent FROM auction_sales WHERE team_id = $1 AND player_id <> $2', [teamId, playerId]);
        if (spentResult.rows[0].spent + Number(price) > team.starting_purse) throw new Error('Team budget exceeded');
        const isIcon = action === 'assignIconPlayer';
        await client.query("UPDATE players SET status = $1, is_icon = $2, sold_price = $3, team_id = $4, updated_at = now() WHERE id = $5", [isIcon ? 'ICON' : 'SOLD', isIcon, price, teamId, playerId]);
        if (isIcon) {
          await client.query('UPDATE teams SET icon_player_id = $1, updated_at = now() WHERE id = $2', [playerId, teamId]);
          await client.query('UPDATE teams SET icon_player_id = NULL, updated_at = now() WHERE icon_player_id = $1 AND id <> $2', [playerId, teamId]);
        }
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
      await query('DELETE FROM auction_sales WHERE player_id = $1', [payload.playerId]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'unassignIconPlayer') {
      await query("UPDATE players SET status = 'ICON', team_id = NULL, sold_price = NULL, updated_at = now() WHERE id = $1 AND is_icon = true", [payload.playerId]);
      await query('UPDATE teams SET icon_player_id = NULL, updated_at = now() WHERE icon_player_id = $1', [payload.playerId]);
      await query('DELETE FROM auction_sales WHERE player_id = $1', [payload.playerId]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'incrementPlayerGoals') {
      await query('UPDATE players SET goals_scored = GREATEST(0, goals_scored + $2), updated_at = now() WHERE id = $1', [payload.playerId, payload.delta]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'updatePlayer') {
      const p = payload.player;
      await query('UPDATE players SET name=$2, roll=$3, series=$4, position=$5, is_icon=$6, status=$7, team_id=$8, sold_price=$9, image_url=$10, rating=$11, assists=$12, updated_at=now() WHERE id=$1', [p.id, p.name, p.roll, p.series, p.position, Boolean(p.isIcon), p.status, p.status === 'AVAILABLE' || p.status === 'UNSOLD' ? null : p.teamId ?? null, p.status === 'AVAILABLE' || p.status === 'UNSOLD' ? null : p.soldPrice ?? null, p.photoUrl ?? null, p.rating ?? null, p.assists ?? 0]);
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
          starting_purse=$6, max_squad_size=$7, owner_id=$8, icon_player_id=$9, updated_at=now()
        `, [t.id, t.name || 'Unnamed Team', t.shortName || t.id.toUpperCase(), t.logoUrl ?? null, t.color || '#00B3A4', t.startingPurse ?? 1500, 11, ownerId, t.iconPlayerId ?? null]);
      return NextResponse.json({ ok: true });
    }

      if (action === 'addTeam') {
        const t = payload.team;
        const owner = await query<{ id: string }>('INSERT INTO team_owners (name, image_url) VALUES ($1, $2) RETURNING id', [t.owner || 'Not configured', t.ownerPhotoUrl ?? null]);
        await query('INSERT INTO teams (id, name, short_name, logo_url, color, starting_purse, max_squad_size, owner_id) VALUES ($1,$2,$3,$4,$5,$6,11,$7)', [t.id, t.name || 'Unnamed Team', t.shortName || t.id.toUpperCase(), t.logoUrl ?? null, t.color || '#00B3A4', t.startingPurse ?? 1500, owner.rows[0].id]);
        return NextResponse.json({ ok: true });
      }

    if (action === 'updateFixtureScore') {
      const f = payload.fixture;
      await query('UPDATE fixtures SET team1_score=$2, team2_score=$3, team1_pens=$4, team2_pens=$5, is_completed=$6, updated_at=now() WHERE id=$1', [f.id, f.team1Score ?? null, f.team2Score ?? null, f.team1Pens ?? null, f.team2Pens ?? null, f.team1Score !== undefined && f.team2Score !== undefined]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'removeTeam') {
      const client = await (await import('@/lib/db')).pool?.connect();
      if (!client) throw new Error('DATABASE_URL is not configured');
      try {
        await client.query('BEGIN');
        const teamResult = await client.query('SELECT owner_id FROM teams WHERE id = $1 FOR UPDATE', [payload.teamId]);
        if (!teamResult.rows[0]) throw new Error('Team not found');
        await client.query("UPDATE players SET team_id = NULL, sold_price = NULL, status = CASE WHEN is_icon THEN 'ICON' ELSE 'AVAILABLE' END, updated_at = now() WHERE team_id = $1", [payload.teamId]);
        await client.query('DELETE FROM auction_sales WHERE team_id = $1', [payload.teamId]);
        await client.query('DELETE FROM teams WHERE id = $1', [payload.teamId]);
        if (teamResult.rows[0].owner_id) {
          await client.query('DELETE FROM team_owners owner_record WHERE owner_record.id = $1 AND NOT EXISTS (SELECT 1 FROM teams WHERE owner_id = owner_record.id)', [teamResult.rows[0].owner_id]);
        }
        await client.query('COMMIT');
        return NextResponse.json({ ok: true });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    if (action === 'performGroupDraw') {
      const teams = (await query<{ id: string; name: string }>('SELECT id, name FROM teams ORDER BY random()')).rows;
      if (teams.length < 6) throw new Error('Six teams are required for group draw');
      for (const [index, team] of teams.entries()) await query('UPDATE teams SET group_name=$2, updated_at=now() WHERE id=$1', [team.id, index < 3 ? 'A' : 'B']);
      const groupA = teams.slice(0, 3);
      const groupB = teams.slice(3, 6);
      const fixtures = [
        [1, 'A', groupA[0], groupA[1], 'Group A - Match 1'], [2, 'A', groupA[1], groupA[2], 'Group A - Match 2'], [3, 'A', groupA[2], groupA[0], 'Group A - Match 3'],
        [4, 'B', groupB[0], groupB[1], 'Group B - Match 1'], [5, 'B', groupB[1], groupB[2], 'Group B - Match 2'], [6, 'B', groupB[2], groupB[0], 'Group B - Match 3'],
        [7, 'SEMIFINAL', { id: 'tbd-a1', name: 'Winner Group A' }, { id: 'tbd-b2', name: 'Runner-up Group B' }, 'Semifinal 1'],
        [8, 'SEMIFINAL', { id: 'tbd-b1', name: 'Winner Group B' }, { id: 'tbd-a2', name: 'Runner-up Group A' }, 'Semifinal 2'],
        [9, 'FINAL', { id: 'tbd-sf1', name: 'Winner SF1' }, { id: 'tbd-sf2', name: 'Winner SF2' }, 'Grand Final']
      ] as const;
      await query('DELETE FROM fixtures');
      for (const [matchNo, group, team1, team2, stageName] of fixtures) {
        const fixtureId = matchNo === 7 ? 'f-sf1' : matchNo === 8 ? 'f-sf2' : matchNo === 9 ? 'f-final' : `f-${matchNo}`;
        await query('INSERT INTO fixtures (id, match_no, group_name, team1_id, team1_name, team2_id, team2_name, stage_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [fixtureId, matchNo, group, team1.id, team1.name, team2.id, team2.name, stageName]);
      }
      await query(`
        INSERT INTO tournament_state (id, standings_overrides)
        VALUES ('current', '{}'::jsonb)
        ON CONFLICT (id) DO UPDATE SET standings_overrides = '{}'::jsonb, updated_at = now()
      `);
      return NextResponse.json({ ok: true });
    }

    if (action === 'restoreCurrentShuffle') {
      const requestedTeams = [
        ['A', 'Highline FC'],
        ['A', 'Imperial FC'],
        ['A', 'Aie Goal Dimu Boys'],
        ['B', 'HATTIMATIM TIM - তারা মাঠে পাড়ে ডিম'],
        ['B', 'Pressure... What Pressure FC'],
        ['B', 'মুরগির খামার ছেড়ে Mourinho Speaking']
      ] as const;
      const names = requestedTeams.map(([, name]) => name);
      const teamResult = await query<{ id: string; name: string }>('SELECT id, name FROM teams WHERE name = ANY($1::text[])', [names]);
      const teamsByName = new Map(teamResult.rows.map(team => [team.name, team]));
      const missing = names.filter(name => !teamsByName.has(name));
      if (missing.length > 0) throw new Error(`Could not find teams: ${missing.join(', ')}`);

      for (const [group, name] of requestedTeams) {
        await query('UPDATE teams SET group_name = $2, updated_at = now() WHERE id = $1', [teamsByName.get(name)!.id, group]);
      }

      const groupA = requestedTeams.slice(0, 3).map(([, name]) => teamsByName.get(name)!);
      const groupB = requestedTeams.slice(3).map(([, name]) => teamsByName.get(name)!);
      const fixtures = [
        ['f-1', 1, 'A', groupA[0], groupA[1], 'Group A - Match 1'], ['f-2', 2, 'A', groupA[1], groupA[2], 'Group A - Match 2'], ['f-3', 3, 'A', groupA[2], groupA[0], 'Group A - Match 3'],
        ['f-4', 4, 'B', groupB[0], groupB[1], 'Group B - Match 1'], ['f-5', 5, 'B', groupB[1], groupB[2], 'Group B - Match 2'], ['f-6', 6, 'B', groupB[2], groupB[0], 'Group B - Match 3'],
        ['f-sf1', 7, 'SEMIFINAL', { id: 'tbd-a1', name: 'Winner Group A' }, { id: 'tbd-b2', name: 'Runner-up Group B' }, 'Semifinal 1'],
        ['f-sf2', 8, 'SEMIFINAL', { id: 'tbd-b1', name: 'Winner Group B' }, { id: 'tbd-a2', name: 'Runner-up Group A' }, 'Semifinal 2'],
        ['f-final', 9, 'FINAL', { id: 'tbd-sf1', name: 'Winner SF1' }, { id: 'tbd-sf2', name: 'Winner SF2' }, 'Grand Final']
      ] as const;
      for (const [id, matchNo, group, team1, team2, stageName] of fixtures) {
        await query(`
          INSERT INTO fixtures (id, match_no, group_name, team1_id, team1_name, team2_id, team2_name, stage_name)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          ON CONFLICT (id) DO UPDATE SET match_no=$2, group_name=$3, team1_id=$4, team1_name=$5, team2_id=$6, team2_name=$7, stage_name=$8, updated_at=now()
        `, [id, matchNo, group, team1.id, team1.name, team2.id, team2.name, stageName]);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'updateStandingOverride') {
      await query(`
        INSERT INTO tournament_state (id, standings_overrides)
        VALUES ('current', jsonb_build_object($1::text, $2::jsonb))
        ON CONFLICT (id) DO UPDATE SET standings_overrides = tournament_state.standings_overrides || jsonb_build_object($1::text, $2::jsonb), updated_at = now()
      `, [payload.teamId, JSON.stringify({ ...(payload.overrideData || {}), manualOverride: true })]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'resetStandingOverrides') {
      await query(`
        INSERT INTO tournament_state (id, standings_overrides)
        VALUES ('current', '{}'::jsonb)
        ON CONFLICT (id) DO UPDATE SET standings_overrides = '{}'::jsonb, updated_at = now()
      `);
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
