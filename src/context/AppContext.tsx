'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team, Player, MatchFixture, GroupStanding, TournamentRule } from '../types';
import { INITIAL_TEAMS, INITIAL_ICON_PLAYERS, INITIAL_POOL_PLAYERS, INITIAL_RULES } from '../data/initialData';

interface AppContextType {
  isAdmin: boolean;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;

  teams: Team[];
  players: Player[];
  rules: TournamentRule[];
  fixtures: MatchFixture[];
  standingsOverrides: Record<string, Partial<GroupStanding>>;

  // Auction specific
  currentStagePlayer: Player | null;
  drawNextRandomPlayer: () => Player | null;
  markPlayerSold: (playerId: string, teamId: string, price: number) => void;
  markPlayerUnsold: (playerId: string) => void;
  assignIconPlayer: (playerId: string, teamId: string, price: number) => void;

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
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [players, setPlayers] = useState<Player[]>([...INITIAL_ICON_PLAYERS, ...INITIAL_POOL_PLAYERS]);
  const [rules, setRules] = useState<TournamentRule[]>(INITIAL_RULES);
  const [fixtures, setFixtures] = useState<MatchFixture[]>([]);
  const [standingsOverrides, setStandingsOverrides] = useState<Record<string, Partial<GroupStanding>>>({});
  const [currentStagePlayer, setCurrentStagePlayer] = useState<Player | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem('ECE_ADMIN_ACTIVE');
      if (storedAdmin === 'true') {
        setIsAdmin(true);
      }

      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.teams) setTeams(parsed.teams);
        if (parsed.players) setPlayers(parsed.players);
        if (parsed.rules) setRules(parsed.rules);
        if (parsed.fixtures) setFixtures(parsed.fixtures);
        if (parsed.standingsOverrides) setStandingsOverrides(parsed.standingsOverrides);
        if (parsed.currentStagePlayer) setCurrentStagePlayer(parsed.currentStagePlayer);
      }
    } catch (e) {
      console.error('Failed to load state from LocalStorage', e);
    }
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
        currentStagePlayer
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state to LocalStorage', e);
    }
  }, [teams, players, rules, fixtures, standingsOverrides, currentStagePlayer]);

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
      if (password === 'ECE2026' || password === 'admin') {
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

  // Team updates
  const updateTeam = (updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    // Update player teamName references
    setPlayers(prev => prev.map(p => p.teamId === updatedTeam.id ? { ...p, teamName: updatedTeam.name } : p));
  };

  // Player updates
  const addPlayer = (newP: Omit<Player, 'id' | 'status' | 'goalsScored'>) => {
    const created: Player = {
      ...newP,
      id: 'p-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      status: newP.isIcon ? 'ICON' : 'AVAILABLE',
      goalsScored: 0
    };
    setPlayers(prev => [...prev, created]);
  };

  const updatePlayer = (updatedP: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedP.id ? updatedP : p));
  };

  const deletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    if (currentStagePlayer?.id === playerId) {
      setCurrentStagePlayer(null);
    }
  };

  const bulkImportPlayers = (newPlayers: Player[], replace: boolean) => {
    if (replace) {
      // Preserve existing Icon players if any
      const existingIcons = players.filter(p => p.isIcon);
      setPlayers([...existingIcons, ...newPlayers]);
    } else {
      setPlayers(prev => [...prev, ...newPlayers]);
    }
  };

  const incrementPlayerGoals = (playerId: string, delta: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const current = p.goalsScored || 0;
        return { ...p, goalsScored: Math.max(0, current + delta) };
      }
      return p;
    }));
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
  };

  // Bidding & Live Auction
  const drawNextRandomPlayer = (): Player | null => {
    const available = players.filter(p => !p.isIcon && p.status === 'AVAILABLE');
    if (available.length === 0) {
      setCurrentStagePlayer(null);
      return null;
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    const chosen = available[randomIndex];
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

    // Auto advance to next player
    setTimeout(() => {
      const remainingAvailable = players.filter(p => p.id !== playerId && !p.isIcon && p.status === 'AVAILABLE');
      if (remainingAvailable.length > 0) {
        const next = remainingAvailable[Math.floor(Math.random() * remainingAvailable.length)];
        setCurrentStagePlayer(next);
      } else {
        setCurrentStagePlayer(null);
      }
    }, 150);
  };

  const markPlayerUnsold = (playerId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, status: 'UNSOLD' };
      }
      return p;
    }));

    // Auto advance to next player
    setTimeout(() => {
      const remainingAvailable = players.filter(p => p.id !== playerId && !p.isIcon && p.status === 'AVAILABLE');
      if (remainingAvailable.length > 0) {
        const next = remainingAvailable[Math.floor(Math.random() * remainingAvailable.length)];
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
  };

  const updateRule = (updatedRule: TournamentRule) => {
    setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const resetRulesToDefault = () => {
    setRules(INITIAL_RULES);
  };

  const resetAllData = () => {
    setTeams(INITIAL_TEAMS);
    setPlayers([...INITIAL_ICON_PLAYERS, ...INITIAL_POOL_PLAYERS]);
    setRules(INITIAL_RULES);
    setFixtures([]);
    setStandingsOverrides({});
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
        currentStagePlayer,
        drawNextRandomPlayer,
        markPlayerSold,
        markPlayerUnsold,
        assignIconPlayer,
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
