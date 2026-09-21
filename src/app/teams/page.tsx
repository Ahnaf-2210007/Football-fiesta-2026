'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { TeamCard } from '@/components/TeamCard';
import { Shield, Lock, Wallet, Users, Crown } from 'lucide-react';

export default function TeamsPage() {
  const { isAdmin, teams, players } = useApp();

  const totalBudgetSpent = players.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
  const totalMaxPurse = teams.reduce((sum, t) => sum + t.startingPurse, 0);

  return (
    <div className="visual-rally rally-teams max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-primary-yellow to-vibrant-orange rounded-xl text-charcoal shadow-glow-yellow">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-bebas text-5xl text-white tracking-wide">TEAMS & ROSTER HUB</h1>
            <p className="text-xs text-light-cyan font-montserrat">Detailed squad rosters, starting purse budgets, and team customization</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-deep-blue border border-teal/30 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] text-gray-400 uppercase block font-semibold">Total Registered Squads</span>
            <span className="font-bebas text-2xl text-teal">{teams.length} Teams</span>
          </div>

          {!isAdmin && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-charcoal/80 px-3 py-2 rounded-xl border border-gray-700">
              <Lock size={14} className="text-primary-yellow" />
              <span>Admin edit locked</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of 6 Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            players={players}
            editable={true}
          />
        ))}
      </div>

    </div>
  );
}
