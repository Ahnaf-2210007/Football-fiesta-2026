import { NextResponse } from 'next/server';
import { INITIAL_ICON_PLAYERS, INITIAL_POOL_PLAYERS, INITIAL_RULES, INITIAL_TEAMS } from '@/data/initialData';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [teamsResult, playersResult, rulesResult, fixturesResult] = await Promise.all([
            query(`
         SELECT teams.id, teams.name, short_name AS "shortName", owners.name AS owner,
           owners.image_url AS "ownerPhotoUrl", logo_url AS "logoUrl", color,
               starting_purse AS "startingPurse",
               COALESCE((SELECT SUM(price) FROM auction_sales s WHERE s.team_id = teams.id), 0)::int AS "spentPurse",
               max_squad_size AS "maxSquadSize", group_name AS "group", owner_id AS "ownerId"
         FROM teams LEFT JOIN team_owners owners ON owners.id = teams.owner_id
         ORDER BY teams.created_at, teams.id
      `),
      query(`
        SELECT id, name, roll, series, position, is_icon AS "isIcon", status,
               sold_price AS "soldPrice", team_id AS "teamId",
               (SELECT name FROM teams t WHERE t.id = players.team_id) AS "teamName",
               goals_scored AS "goalsScored", assists, image_url AS "photoUrl", rating
        FROM players ORDER BY created_at, id
      `),
      query(`
        SELECT id, title, description, category, is_default AS "isDefault"
        FROM tournament_rules ORDER BY id
      `),
      query(`
        SELECT id, match_no AS "matchNo", group_name AS "group", team1_id AS "team1Id",
               team1_name AS "team1Name", team2_id AS "team2Id", team2_name AS "team2Name",
               team1_score AS "team1Score", team2_score AS "team2Score",
               team1_pens AS "team1Pens", team2_pens AS "team2Pens",
               is_completed AS "isCompleted", stage_name AS "stageName", time_slot AS "timeSlot"
        FROM fixtures ORDER BY match_no
      `)
    ]);

    return NextResponse.json({ teams: teamsResult.rows, players: playersResult.rows, rules: rulesResult.rows, fixtures: fixturesResult.rows, source: 'database' });
  } catch (error) {
    console.error('Database state load failed:', error);
    return NextResponse.json({
      teams: INITIAL_TEAMS,
      players: [...INITIAL_ICON_PLAYERS, ...INITIAL_POOL_PLAYERS],
      rules: INITIAL_RULES,
      source: 'seed-fallback'
    });
  }
}