-- ECE Football Fiesta PostgreSQL schema
-- Apply with: psql "$DATABASE_URL" -f database/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS team_owners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE team_owners ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  owner_id TEXT REFERENCES team_owners(id) ON DELETE SET NULL,
  logo_url TEXT,
  color TEXT NOT NULL,
  starting_purse INTEGER NOT NULL DEFAULT 1500 CHECK (starting_purse >= 0),
  max_squad_size INTEGER NOT NULL DEFAULT 11 CHECK (max_squad_size > 0),
  icon_player_id TEXT,
  group_name TEXT CHECK (group_name IN ('A', 'B')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE teams ADD COLUMN IF NOT EXISTS icon_player_id TEXT;
ALTER TABLE teams ALTER COLUMN max_squad_size SET DEFAULT 11;
UPDATE teams SET max_squad_size = 11 WHERE max_squad_size IN (9, 10);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  roll TEXT NOT NULL UNIQUE,
  series TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('FORWARD', 'MIDFIELDER', 'DEFENDER', 'GOALKEEPER')),
  is_icon BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'SOLD', 'UNSOLD', 'ICON')),
  sold_price INTEGER CHECK (sold_price IS NULL OR sold_price >= 0),
  team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
  goals_scored INTEGER NOT NULL DEFAULT 0 CHECK (goals_scored >= 0),
  assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
  image_url TEXT,
  drive_file_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_icon_player_id_fkey;
ALTER TABLE teams ADD CONSTRAINT teams_icon_player_id_fkey
  FOREIGN KEY (icon_player_id) REFERENCES players(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS auction_sales (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  price INTEGER NOT NULL CHECK (price >= 0),
  is_icon_sale BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id)
);

CREATE TABLE IF NOT EXISTS tournament_rules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('BUDGET', 'SQUAD', 'BIDDING', 'MATCH', 'GENERAL')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fixtures (
  id TEXT PRIMARY KEY,
  match_no INTEGER NOT NULL,
  group_name TEXT CHECK (group_name IN ('A', 'B', 'SEMIFINAL', 'FINAL')),
  team1_id TEXT NOT NULL,
  team1_name TEXT NOT NULL,
  team2_id TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  team1_score INTEGER,
  team2_score INTEGER,
  team1_pens INTEGER,
  team2_pens INTEGER,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  stage_name TEXT NOT NULL,
  time_slot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS players_team_id_idx ON players(team_id);
CREATE INDEX IF NOT EXISTS players_status_idx ON players(status);
CREATE INDEX IF NOT EXISTS auction_sales_team_id_idx ON auction_sales(team_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS team_owners_updated_at ON team_owners;
CREATE TRIGGER team_owners_updated_at
BEFORE UPDATE ON team_owners
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS teams_updated_at ON teams;
CREATE TRIGGER teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS players_updated_at ON players;
CREATE TRIGGER players_updated_at
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS tournament_rules_updated_at ON tournament_rules;
CREATE TRIGGER tournament_rules_updated_at
BEFORE UPDATE ON tournament_rules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
