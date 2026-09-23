import { NextResponse } from 'next/server';
import { INITIAL_RULES, INITIAL_TEAMS } from '@/data/initialData';

const EMPTY_TEAMS = INITIAL_TEAMS.map((team) => ({
  ...team,
  name: '',
  shortName: '',
  owner: '',
  ownerPhotoUrl: undefined,
  logoUrl: undefined,
  group: undefined
}));
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [teamsResult, playersResult, rulesResult, fixturesResult, tournamentStateResult] = await Promise.all([
            query(`
         SELECT teams.id, teams.name, short_name AS "shortName", owners.name AS owner,
           owners.image_url AS "ownerPhotoUrl", logo_url AS "logoUrl", color,
               starting_purse AS "startingPurse",
               COALESCE((SELECT SUM(price) FROM auction_sales s WHERE s.team_id = teams.id), 0)::int AS "spentPurse",
               group_name AS "group", owner_id AS "ownerId",
               CASE WHEN EXISTS (
                 SELECT 1 FROM players icon_check
                 WHERE icon_check.id = teams.icon_player_id
                   AND icon_check.team_id = teams.id
                   AND icon_check.is_icon = true
                   AND icon_check.status = 'ICON'
               ) THEN icon_player_id ELSE NULL END AS "iconPlayerId"
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
               is_completed AS "isCompleted", stage_name AS "stageName", time_slot AS "timeSlot",
               scheduled_date AS "scheduledDate", scheduled_time AS "scheduledTime"
        FROM fixtures ORDER BY match_no
      `),
      query(`
        SELECT standings_overrides AS "standingsOverrides"
        FROM tournament_state WHERE id = 'current'
      `)
    ]);

    return NextResponse.json({
      teams: teamsResult.rows,
      players: playersResult.rows,
      rules: rulesResult.rows,
      fixtures: fixturesResult.rows,
      standingsOverrides: tournamentStateResult.rows[0]?.standingsOverrides || {},
      source: 'database'
    });
  } catch (error) {
    console.error('Database state load failed:', error);
    return NextResponse.json({
      teams: EMPTY_TEAMS,
      players: [],
      rules: INITIAL_RULES,
      fixtures: [],
      standingsOverrides: {},
      source: 'database-unavailable'
    }, { status: 503 });
  }
}