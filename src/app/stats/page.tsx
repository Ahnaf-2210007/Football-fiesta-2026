'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Award, Trophy, Crown, User, Plus, Minus, Lock, Flame } from 'lucide-react';

export default function StatsAndAwardsPage() {
  const { isAdmin, players, incrementPlayerGoals } = useApp();

  // Sort players by goals scored
  const sortedScorers = [...players]
    .filter(p => (p.goalsScored || 0) >= 0)
    .sort((a, b) => (b.goalsScored || 0) - (a.goalsScored || 0));

  const goldenBootWinner = sortedScorers.find(p => (p.goalsScored || 0) > 0) || sortedScorers[0];
  const goldenGloveCandidate = players.find(p => p.position === 'GOALKEEPER' && p.teamId) || players.find(p => p.position === 'GOALKEEPER');
  const playerOfTournament = players.find(p => p.isIcon) || sortedScorers[0];

  return (
    <div className="visual-rally rally-stats max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-primary-yellow to-vibrant-orange rounded-xl text-charcoal shadow-glow-yellow">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-bebas text-5xl text-white tracking-wide">STATS & AWARDS HUB</h1>
            <p className="text-xs text-light-cyan font-montserrat">Golden Boot leaderboards, top scorers, and tournament honor roll</p>
          </div>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-charcoal/80 px-4 py-2 rounded-xl border border-gray-700">
            <Lock size={16} className="text-primary-yellow" />
            <span>Admin login required to edit goal counts</span>
          </div>
        )}
      </div>

      {/* Honor Awards Showcase Cards */}
      <section className="space-y-6">
        <div className="border-b border-gray-800 pb-3">
          <h2 className="font-bebas text-4xl text-white tracking-wide flex items-center gap-2">
            <Trophy className="text-primary-yellow" /> TOURNAMENT HONOR AWARDS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Golden Boot */}
          <div className="glass-panel-gold p-6 rounded-3xl space-y-4 text-center border-2 border-primary-yellow/50 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-primary-yellow/10 border border-primary-yellow/40 flex items-center justify-center mx-auto text-primary-yellow shadow-glow-yellow">
              <Flame size={32} />
            </div>
            <div>
              <span className="text-xs font-bebas text-primary-yellow uppercase tracking-widest bg-primary-yellow/10 px-3 py-1 rounded-full">
                GOLDEN BOOT
              </span>
              <h3 className="font-bebas text-3xl text-white mt-2">Top Goal Scorer</h3>
            </div>

            {goldenBootWinner ? (
              <div className="bg-charcoal/80 p-4 rounded-2xl border border-gray-800 space-y-2">
                <p className="font-bebas text-2xl text-primary-yellow">{goldenBootWinner.name}</p>
                <p className="text-xs text-gray-400">{goldenBootWinner.teamName || 'Unassigned'} • {goldenBootWinner.roll}</p>
                <span className="inline-block font-bebas text-3xl text-vibrant-orange mt-1">
                  {goldenBootWinner.goalsScored || 0} GOALS
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No goals scored yet</p>
            )}
          </div>

          {/* Golden Glove */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 text-center border border-teal/40 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-teal/10 border border-teal/40 flex items-center justify-center mx-auto text-teal shadow-glow-cyan">
              <Award size={32} />
            </div>
            <div>
              <span className="text-xs font-bebas text-teal uppercase tracking-widest bg-teal/10 px-3 py-1 rounded-full">
                GOLDEN GLOVE
              </span>
              <h3 className="font-bebas text-3xl text-white mt-2">Best Goalkeeper</h3>
            </div>

            {goldenGloveCandidate ? (
              <div className="bg-charcoal/80 p-4 rounded-2xl border border-gray-800 space-y-2">
                <p className="font-bebas text-2xl text-teal">{goldenGloveCandidate.name}</p>
                <p className="text-xs text-gray-400">{goldenGloveCandidate.teamName || 'Unassigned'} • {goldenGloveCandidate.roll}</p>
                <span className="inline-block font-bebas text-lg text-light-cyan mt-1">
                  PREMIER SHOT STOPPER
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Pending match completions</p>
            )}
          </div>

          {/* Player of the Tournament */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 text-center border border-vibrant-orange/40 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-vibrant-orange/10 border border-vibrant-orange/40 flex items-center justify-center mx-auto text-vibrant-orange shadow-glow-orange">
              <Crown size={32} />
            </div>
            <div>
              <span className="text-xs font-bebas text-vibrant-orange uppercase tracking-widest bg-vibrant-orange/10 px-3 py-1 rounded-full">
                MVP AWARD
              </span>
              <h3 className="font-bebas text-3xl text-white mt-2">Player of Tournament</h3>
            </div>

            {playerOfTournament ? (
              <div className="bg-charcoal/80 p-4 rounded-2xl border border-gray-800 space-y-2">
                <p className="font-bebas text-2xl text-vibrant-orange">{playerOfTournament.name}</p>
                <p className="text-xs text-gray-400">{playerOfTournament.teamName || 'Unassigned'} • {playerOfTournament.roll}</p>
                <span className="inline-block font-bebas text-lg text-primary-yellow mt-1">
                  OUTSTANDING PERFORMER
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Pending tournament conclusion</p>
            )}
          </div>

        </div>
      </section>

      {/* Top Scorers Leaderboard Table */}
      <section className="space-y-6">
        <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
          <h2 className="font-bebas text-4xl text-white tracking-wide flex items-center gap-2">
            <Flame className="text-vibrant-orange" /> GOAL SCORERS LEADERBOARD
          </h2>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-montserrat">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Player Name</th>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4 text-center font-bold text-primary-yellow">Goals</th>
                  {isAdmin && <th className="py-3 px-4 text-center">Admin Controls</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sortedScorers.slice(0, 15).map((player, idx) => (
                  <tr key={player.id} className="hover:bg-deep-blue/40 transition-colors">
                    <td className="py-3 px-4 font-bebas text-xl text-primary-yellow">
                      #{idx + 1}
                    </td>

                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-charcoal border border-gray-700 flex items-center justify-center shrink-0">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <User size={16} className="text-gray-400" />
                        )}
                      </div>
                      <span className="font-bold text-white text-sm">{player.name}</span>
                    </td>

                    <td className="py-3 px-4 text-gray-300 font-mono">{player.roll}</td>

                    <td className="py-3 px-4 text-light-cyan font-semibold">
                      {player.teamName || <span className="text-gray-500 italic">Unassigned</span>}
                    </td>

                    <td className="py-3 px-4 text-gray-400 font-bebas text-sm">
                      {player.position}
                    </td>

                    <td className="py-3 px-4 text-center font-bebas text-2xl text-vibrant-orange font-bold">
                      {player.goalsScored || 0}
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => incrementPlayerGoals(player.id, -1)}
                            className="p-1 bg-gray-800 hover:bg-fiery-red text-white rounded transition-colors"
                            title="Decrement Goals"
                          >
                            <Minus size={14} />
                          </button>
                          <button
                            onClick={() => incrementPlayerGoals(player.id, 1)}
                            className="p-1 bg-gray-800 hover:bg-teal text-white rounded transition-colors"
                            title="Increment Goals"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
