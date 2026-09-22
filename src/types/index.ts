export type PlayerPosition = 'FORWARD' | 'MIDFIELDER' | 'DEFENDER' | 'GOALKEEPER';

export type PlayerStatus = 'AVAILABLE' | 'SOLD' | 'UNSOLD' | 'ICON';

export interface Player {
  id: string;
  name: string;
  roll: string;
  series: string;
  position: PlayerPosition;
  isIcon: boolean;
  status: PlayerStatus;
  soldPrice?: number;
  teamId?: string;
  teamName?: string;
  goalsScored?: number;
  assists?: number;
  photoUrl?: string;
  rating?: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  owner: string;
  ownerPhotoUrl?: string;
  iconPlayerId?: string;
  logoUrl?: string;
  color: string;
  startingPurse: number;
  spentPurse: number;
  maxSquadSize: number;
  group?: 'A' | 'B';
}

export interface MatchFixture {
  id: string;
  matchNo: number;
  group?: 'A' | 'B' | 'SEMIFINAL' | 'FINAL';
  team1Id: string;
  team1Name: string;
  team2Id: string;
  team2Name: string;
  team1Score?: number;
  team2Score?: number;
  team1Pens?: number;
  team2Pens?: number;
  isCompleted: boolean;
  stageName: string;
  timeSlot?: string;
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  shortName: string;
  group: 'A' | 'B';
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  manualOverride?: boolean;
}

export interface TournamentRule {
  id: string;
  title: string;
  description: string;
  category: 'BUDGET' | 'SQUAD' | 'BIDDING' | 'MATCH' | 'GENERAL';
  isDefault?: boolean;
}

export interface TournamentAward {
  id: string;
  title: string;
  awardName: string;
  recipientName?: string;
  recipientTeam?: string;
  statsDetail?: string;
  iconName: string;
}
