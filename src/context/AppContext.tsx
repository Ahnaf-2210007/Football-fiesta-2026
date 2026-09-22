'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team, Player, MatchFixture, GroupStanding, TournamentRule } from '../types';
import { INITIAL_TEAMS, INITIAL_RULES } from '../data/initialData';

const EMPTY_TEAMS: Team[] = INITIAL_TEAMS.map((team, index) => ({
  id: team.id || `team-${index + 1}`,
  name: '',
  shortName: '',
  owner: '',
  logoUrl: undefined,
  ownerPhotoUrl: undefined,
  color: team.color,
  startingPurse: 1500,
  spentPurse: 0,
  maxSquadSize: 9,
  group: undefined
}));

interface AppContextType {
  isAdmin: boolean;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;

  teams: Team[];
  players: Player[];
  rules: TournamentRule[];
  fixtures: MatchFixture[];
  standingsOverrides: Record<string, Partial<GroupStanding>>;
  customAwards: Record<string, { recipientName?: string; recipientTeam?: string; detail?: string }>;
  updateAward: (awardId: string, awardData: { recipientName?: string; recipientTeam?: string; detail?: string }) => void;

  // Auction specific
  currentStagePlayer: Player | null;
  drawNextRandomPlayer: () => Player | null;
  markPlayerSold: (playerId: string, teamId: string, price: number) => void;
  markPlayerUnsold: (playerId: string) => void;
  assignIconPlayer: (playerId: string, teamId: string, price: number) => void;
  unassignIconPlayer: (playerId: string) => void;
  assignGoalkeeper: (playerId: string, teamId: string, price: number) => void;
  addTeam: (team: Team) => void;

  // Management actions
  updateTeam: (updatedTeam: Team) => void;
  addPlayer: (newPlayer: Omit<Player, 'id' | 'status' | 'goalsScored'>) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  bulkImportPlayers: (newPlayers: Player[], replace: boolean) => void;
  incrementPlayerGoals: (playerId: string, delta: number) => void;

  // Tournament actions
  performGroupDraw: () => void;
  updateFixtureScore: (fixtureId: string, team1Score?: number, team2Score?: number, team1Pens?: number, team2Pens?: number) => void;
  updateStandingOverride: (teamId: string, overrideData: Partial<GroupStanding>) => void;
  resetStandingOverrides: () => void;

  // Rules actions
  addRule: (rule: Omit<TournamentRule, 'id'>) => void;
  updateRule: (rule: TournamentRule) => void;
  deleteRule: (ruleId: string) => void;
  resetRulesToDefault: () => void;

  // Reset entire dataset
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ECE_FOOTBALL_FIESTA_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [teams, setTeams] = useState<Team[]>(EMPTY_TEAMS);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rules, setRules] = useState<TournamentRule[]>(INITIAL_RULES);
  const [fixtures, setFixtures] = useState<MatchFixture[]>([]);
  const [standingsOverrides, setStandingsOverrides] = useState<Record<string, Partial<GroupStanding>>>({});
  const [currentStagePlayer, setCurrentStagePlayer] = useState<Player | null>(null);

  const [customAwards, setCustomAwards] = useState<Record<string, { recipientName?: string; recipientTeam?: string; detail?: string }>>({});

  // Load local state first, then refresh shared data from PostgreSQL.
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedAdmin = localStorage.getItem('ECE_ADMIN_ACTIVE');
        if (storedAdmin === 'true') {
          setIsAdmin(true);
        }

        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (parsed.teams) setTeams(parsed.teams);
          // Player data is server-owned. Do not restore the old dummy/local copy.
          if (parsed.rules) setRules(parsed.rules);
          if (parsed.fixtures) setFixtures(parsed.fixtures);
          if (parsed.standingsOverrides) setStandingsOverrides(parsed.standingsOverrides);
          if (parsed.currentStagePlayer) setCurrentStagePlayer(parsed.currentStagePlayer);
          if (parsed.customAwards) setCustomAwards(parsed.customAwards);
        }

        const response = await fetch('/api/state', { cache: 'no-store' });
        if (response.ok) {
          const databaseState = await response.json();
          if (Array.isArray(databaseState.teams)) setTeams(databaseState.teams.length ? databaseState.teams : EMPTY_TEAMS);
          if (Array.isArray(databaseState.players)) setPlayers(databaseState.players);
          if (Array.isArray(databaseState.rules)) setRules(databaseState.rules);
          if (Array.isArray(databaseState.fixtures)) setFixtures(databaseState.fixtures);
        }
      } catch (e) {
        console.error('Failed to load application state', e);
      }
    };

    void loadState();
  }, []);

  // Save state changes to local storage
  useEffect(() => {
    try {
      const stateToSave = {
        teams,
        players,
        rules,
        fixtures,
        standingsOverrides,
        currentStagePlayer,
        customAwards
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state to LocalStorage', e);
    }
  }, [teams, players, rules, fixtures, standingsOverrides, currentStagePlayer, customAwards]);

  const loginAdmin = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        localStorage.setItem('ECE_ADMIN_ACTIVE', 'true');
        return true;
      }
      return false;
    } catch (err) {
      // Fallback client check if API fails or offline
      if (password === 'ECE22') {
        setIsAdmin(true);
        localStorage.setItem('ECE_ADMIN_ACTIVE', 'true');
        return true;
      }
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('ECE_ADMIN_ACTIVE');
  };

  const persistMutation = (action: string, data: Record<string, unknown>) => {
    void fetch('/api/mutations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data })
    }).then(async response => {
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || `Mutation failed: ${action}`);
      }
    }).catch(error => console.error(error));
  };

  // Team updates
  const updateTeam = (updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    // Update player teamName references
    setPlayers(prev => prev.map(p => p.teamId === updatedTeam.id ? { ...p, teamName: updatedTeam.name } : p));
    persistMutation('updateTeam', { team: updatedTeam as unknown as Record<string, unknown> });
  };

  // Player updates
  const addPlayer = (newP: Omit<Player, 'id' | 'status' | 'goalsScored'>) => {
    const created: Player = {
      ...newP,
      id: 'p-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      status: newP.isIcon ? 'ICON' : 'AVAILABLE',
      goalsScored: 0
    };
    void fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    }).then(async response => {
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Unable to save player');
      }
      setPlayers(prev => [...prev, created]);
    }).catch(error => {
      console.error(error);
      window.alert(error instanceof Error ? error.message : 'Unable to save player');
    });
  };

  const updatePlayer = (updatedP: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedP.id ? updatedP : p));
    persistMutation('updatePlayer', { player: updatedP as unknown as Record<string, unknown> });
  };

  const deletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    if (currentStagePlayer?.id === playerId) {
      setCurrentStagePlayer(null);
    }
    void fetch(`/api/players/${playerId}`, { method: 'DELETE' });
  };

  const bulkImportPlayers = (newPlayers: Player[], replace: boolean) => {
    void fetch('/api/players/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players: newPlayers, replace })
    }).then(async response => {
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Unable to import players');
      }
      setPlayers(previous => replace ? [...previous.filter(player => player.isIcon), ...newPlayers] : [...previous, ...newPlayers]);
    }).catch(error => {
      console.error(error);
      window.alert(error instanceof Error ? error.message : 'Unable to import players');
    });
  };

  const incrementPlayerGoals = (playerId: string, delta: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const current = p.goalsScored || 0;
        return { ...p, goalsScored: Math.max(0, current + delta) };
      }
      return p;
    }));
    persistMutation('incrementPlayerGoals', { playerId, delta });
  };

  // Icon Assignment
  const assignIconPlayer = (playerId: string, teamId: string, price: number) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          status: 'ICON',
          isIcon: true,
          soldPrice: price,
          teamId: targetTeam.id,
          teamName: targetTeam.name
        };
      }
      return p;
    }));

    // Recalculate team spent budget
    recalculateTeamSpent(teamId, price);
    persistMutation('assignIconPlayer', { playerId, teamId, price });
  };

  const unassignIconPlayer = (playerId: string) => {
    const currentPlayer = players.find(p => p.id === playerId);
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, status: 'ICON', soldPrice: undefined, teamId: undefined, teamName: undefined } : p));
    setTeams(prev => prev.map(t => {
      if (t.iconPlayerId === playerId || t.id === currentPlayer?.teamId) {
        return { ...t, iconPlayerId: undefined, spentPurse: Math.max(0, t.spentPurse - (currentPlayer?.soldPrice || 0)) };
      }
      return t;
    }));
    persistMutation('unassignIconPlayer', { playerId });
  };

  const assignGoalkeeper = (playerId: string, teamId: string, price: number) => {
    const targetTeam = teams.find(t => t.id === teamId);
    const currentPlayer = players.find(p => p.id === playerId);
    if (!targetTeam) return;
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, status: 'SOLD', soldPrice: price, teamId, teamName: targetTeam.name } : p));
    setTeams(prev => prev.map(t => {
      if (t.id === currentPlayer?.teamId && t.id !== teamId) return { ...t, spentPurse: Math.max(0, t.spentPurse - (currentPlayer.soldPrice || 0)) };
      if (t.id === teamId) return { ...t, spentPurse: t.spentPurse - (currentPlayer?.teamId === teamId ? (currentPlayer.soldPrice || 0) : 0) + price };
      return t;
    }));
    persistMutation('assignGoalkeeper', { playerId, teamId, price });
  };

  const addTeam = (team: Team) => {
    setTeams(prev => [...prev, team]);
    persistMutation('addTeam', { team: team as unknown as Record<string, unknown> });
  };

  // Bidding & Live Auction
  const getAuctionCandidates = (excludedPlayerId?: string) => players.filter(p =>
    !p.isIcon &&
    (p.status === 'AVAILABLE' || p.status === 'UNSOLD') &&
    p.id !== excludedPlayerId &&
    !p.teamId
  );

  const drawNextRandomPlayer = (): Player | null => {
    const candidates = getAuctionCandidates();
    if (candidates.length === 0) {
      setCurrentStagePlayer(null);
      return null;
    }
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    setCurrentStagePlayer(chosen);
    return chosen;
  };

  const markPlayerSold = (playerId: string, teamId: string, price: number) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    // Update player
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          status: 'SOLD',
          soldPrice: price,
          teamId: targetTeam.id,
          teamName: targetTeam.name
        };
      }
      return p;
    }));

    // Update team spent purse
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          spentPurse: t.spentPurse + price
        };
      }
      return t;
    }));
    persistMutation('markPlayerSold', { playerId, teamId, price });

    // Auto advance to next player
    setTimeout(() => {
      const remainingCandidates = getAuctionCandidates(playerId);
      if (remainingCandidates.length > 0) {
        const next = remainingCandidates[Math.floor(Math.random() * remainingCandidates.length)];
        setCurrentStagePlayer(next);
      } else {
        setCurrentStagePlayer(null);
      }
    }, 150);
  };

  const markPlayerUnsold = (playerId: string) => {
    const currentPlayer = players.find(p => p.id === playerId);
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, status: 'UNSOLD', teamId: undefined, teamName: undefined, soldPrice: undefined };
      }
      return p;
    }));
    if (currentPlayer?.teamId) {
      setTeams(prev => prev.map(team => team.id === currentPlayer.teamId ? {
        ...team,
        spentPurse: Math.max(0, team.spentPurse - (currentPlayer.soldPrice || 0))
      } : team));
    }
    persistMutation('markPlayerUnsold', { playerId });

    // Auto advance to next player
    setTimeout(() => {
      const remainingCandidates = getAuctionCandidates(playerId);
      if (remainingCandidates.length > 0) {
        const next = remainingCandidates[Math.floor(Math.random() * remainingCandidates.length)];
        setCurrentStagePlayer(next);
      } else {
        setCurrentStagePlayer(null);
      }
    }, 150);
  };

  const recalculateTeamSpent = (teamId: string, additionalPrice: number) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        const teamPlayers = players.filter(p => p.teamId === teamId);
        const currentSpent = teamPlayers.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
        return { ...t, spentPurse: currentSpent + additionalPrice };
      }
      return t;
    }));
  };

  // Group Draw & Fixtures Generator
  const performGroupDraw = () => {
    const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
    const groupA = shuffledTeams.slice(0, 3);
    const groupB = shuffledTeams.slice(3, 6);

    const updatedTeams = teams.map(t => {
      if (groupA.some(a => a.id === t.id)) return { ...t, group: 'A' as const };
      return { ...t, group: 'B' as const };
    });

    setTeams(updatedTeams);

    // Create Round-Robin Matches for Group A (3 matches) & Group B (3 matches)
    const newFixtures: MatchFixture[] = [
      // Group A Matches
      { id: 'f-1', matchNo: 1, group: 'A', team1Id: groupA[0].id, team1Name: groupA[0].name, team2Id: groupA[1].id, team2Name: groupA[1].name, isCompleted: false, stageName: 'Group A - Match 1' },
      { id: 'f-2', matchNo: 2, group: 'A', team1Id: groupA[1].id, team1Name: groupA[1].name, team2Id: groupA[2].id, team2Name: groupA[2].name, isCompleted: false, stageName: 'Group A - Match 2' },
      { id: 'f-3', matchNo: 3, group: 'A', team1Id: groupA[2].id, team1Name: groupA[2].name, team2Id: groupA[0].id, team2Name: groupA[0].name, isCompleted: false, stageName: 'Group A - Match 3' },

      // Group B Matches
      { id: 'f-4', matchNo: 4, group: 'B', team1Id: groupB[0].id, team1Name: groupB[0].name, team2Id: groupB[1].id, team2Name: groupB[1].name, isCompleted: false, stageName: 'Group B - Match 1' },
      { id: 'f-5', matchNo: 5, group: 'B', team1Id: groupB[1].id, team1Name: groupB[1].name, team2Id: groupB[2].id, team2Name: groupB[2].name, isCompleted: false, stageName: 'Group B - Match 2' },
      { id: 'f-6', matchNo: 6, group: 'B', team1Id: groupB[2].id, team1Name: groupB[2].name, team2Id: groupB[0].id, team2Name: groupB[0].name, isCompleted: false, stageName: 'Group B - Match 3' },

      // Knockout Placeholder Matches
      { id: 'f-sf1', matchNo: 7, group: 'SEMIFINAL', team1Id: 'tbd-a1', team1Name: 'Winner Group A', team2Id: 'tbd-b2', team2Name: 'Runner-up Group B', isCompleted: false, stageName: 'Semifinal 1' },
      { id: 'f-sf2', matchNo: 8, group: 'SEMIFINAL', team1Id: 'tbd-b1', team1Name: 'Winner Group B', team2Id: 'tbd-a2', team2Name: 'Runner-up Group A', isCompleted: false, stageName: 'Semifinal 2' },
      { id: 'f-final', matchNo: 9, group: 'FINAL', team1Id: 'tbd-sf1', team1Name: 'Winner SF1', team2Id: 'tbd-sf2', team2Name: 'Winner SF2', isCompleted: false, stageName: 'Grand Final' }
    ];

    setFixtures(newFixtures);
    persistMutation('performGroupDraw', {});
  };

  const updateFixtureScore = (fixtureId: string, team1Score?: number, team2Score?: number, team1Pens?: number, team2Pens?: number) => {
    setFixtures(prev => prev.map(f => {
      if (f.id === fixtureId) {
        const isCompleted = team1Score !== undefined && team2Score !== undefined && team1Score !== null && team2Score !== null;
        return {
          ...f,
          team1Score,
          team2Score,
          team1Pens,
          team2Pens,
          isCompleted
        };
      }
      return f;
    }));
    const fixture = fixtures.find(item => item.id === fixtureId);
    if (fixture) persistMutation('updateFixtureScore', { fixture: { ...fixture, team1Score, team2Score, team1Pens, team2Pens } as unknown as Record<string, unknown> });
  };

  const updateStandingOverride = (teamId: string, overrideData: Partial<GroupStanding>) => {
    setStandingsOverrides(prev => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || {}), ...overrideData, manualOverride: true }
    }));
  };

  const resetStandingOverrides = () => {
    setStandingsOverrides({});
  };

  // Rule actions
  const addRule = (ruleData: Omit<TournamentRule, 'id'>) => {
    const createdRule: TournamentRule = {
      ...ruleData,
      id: 'rule-' + Date.now()
    };
    setRules(prev => [...prev, createdRule]);
    persistMutation('addRule', { rule: createdRule as unknown as Record<string, unknown> });
  };

  const updateRule = (updatedRule: TournamentRule) => {
    setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
    persistMutation('updateRule', { rule: updatedRule as unknown as Record<string, unknown> });
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    persistMutation('deleteRule', { ruleId });
  };

  const resetRulesToDefault = () => {
    setRules(INITIAL_RULES);
  };

  const updateAward = (awardId: string, awardData: { recipientName?: string; recipientTeam?: string; detail?: string }) => {
    setCustomAwards(prev => ({
      ...prev,
      [awardId]: { ...(prev[awardId] || {}), ...awardData }
    }));
  };

  const resetAllData = () => {
    setTeams(EMPTY_TEAMS);
    setPlayers([]);
    setRules(INITIAL_RULES);
    setFixtures([]);
    setStandingsOverrides({});
    setCustomAwards({});
    setCurrentStagePlayer(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        isAdmin,
        loginAdmin,
        logoutAdmin,
        teams,
        players,
        rules,
        fixtures,
        standingsOverrides,
        customAwards,
        updateAward,
        currentStagePlayer,
        drawNextRandomPlayer,
        markPlayerSold,
        markPlayerUnsold,
        assignIconPlayer,
        unassignIconPlayer,
        assignGoalkeeper,
        addTeam,
        updateTeam,
        addPlayer,
        updatePlayer,
        deletePlayer,
        bulkImportPlayers,
        incrementPlayerGoals,
        performGroupDraw,
        updateFixtureScore,
        updateStandingOverride,
        resetStandingOverrides,
        addRule,
        updateRule,
        deleteRule,
        resetRulesToDefault,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
