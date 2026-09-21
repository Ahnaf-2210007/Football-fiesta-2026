'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { normalizeImageUrl, handleImageError } from '@/utils/imageUtils';
import { Award, Trophy, Crown, User, Plus, Minus, Lock, Flame, Edit2, X, UserCheck } from 'lucide-react';

export default function StatsAndAwardsPage() {
  const { isAdmin, players, incrementPlayerGoals, customAwards, updateAward, updatePlayer } = useApp();

  // Sort players by goals scored
  const sortedScorers = [...players]
    .filter(p => (p.goalsScored || 0) >= 0)
    .sort((a, b) => (b.goalsScored || 0) - (a.goalsScored || 0));

  // Default computed award winners
  const defaultGoldenBoot = sortedScorers.find(p => (p.goalsScored || 0) > 0) || sortedScorers[0];
  const defaultGoldenGlove = players.find(p => p.position === 'GOALKEEPER' && p.teamId) || players.find(p => p.position === 'GOALKEEPER');
  const defaultMVP = players.find(p => p.isIcon) || sortedScorers[0];

  // Award modal state
  const [editingAwardKey, setEditingAwardKey] = useState<string | null>(null);
  const [editRecipientName, setEditRecipientName] = useState('');
  const [editRecipientTeam, setEditRecipientTeam] = useState('');
  const [editDetail, setEditDetail] = useState('');

  // Top scorer modal state
  const [editingScorerPlayerId, setEditingScorerPlayerId] = useState<string | null>(null);
  const [scorerSelectedPlayerId, setScorerSelectedPlayerId] = useState<string>('');
  const [scorerGoals, setScorerGoals] = useState<number>(1);

  const openAwardEditModal = (key: string, defaultPlayer?: any, defaultStatDetail?: string) => {
    const existing = customAwards[key];
    setEditingAwardKey(key);
    setEditRecipientName(existing?.recipientName || defaultPlayer?.name || '');
    setEditRecipientTeam(existing?.recipientTeam || defaultPlayer?.teamName || '');
    setEditDetail(existing?.detail || defaultStatDetail || '');
  };

  const handleSaveAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAwardKey) return;
    updateAward(editingAwardKey, {
      recipientName: editRecipientName,
      recipientTeam: editRecipientTeam,
      detail: editDetail
    });
    setEditingAwardKey(null);
  };

  const handleSaveScorerGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scorerSelectedPlayerId) return;
    const targetPlayer = players.find(p => p.id === scorerSelectedPlayerId);
    if (targetPlayer) {
      updatePlayer({
        ...targetPlayer,
        goalsScored: Math.max(0, scorerGoals)
      });
    }
    setEditingScorerPlayerId(null);
  };

  // Resolved award details
  const getAwardInfo = (key: string, defaultPlayer?: any, defaultStatDetail?: string) => {
    const custom = customAwards[key];
    return {
      name: custom?.recipientName || defaultPlayer?.name || 'Pending',
      team: custom?.recipientTeam || defaultPlayer?.teamName || 'Unassigned',
      detail: custom?.detail || defaultStatDetail || 'Honor Award'
    };
  };

  const goldenBoot = getAwardInfo('golden_boot', defaultGoldenBoot, `${defaultGoldenBoot?.goalsScored || 0} GOALS`);
  const goldenGlove = getAwardInfo('golden_glove', defaultGoldenGlove, 'PREMIER SHOT STOPPER');
  const mvpAward = getAwardInfo('mvp', defaultMVP, 'OUTSTANDING PERFORMER');

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
            <p className="text-xs text-light-cyan font-montserrat">Top 5 Goal Scorers Leaderboard & Editable Tournament Honor Awards</p>
          </div>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-charcoal/80 px-4 py-2 rounded-xl border border-gray-700">
            <Lock size={16} className="text-primary-yellow" />
            <span>Admin login required to edit goal counts & awards</span>
          </div>
        )}
      </div>

      {/* Honor Awards Showcase Cards */}
      <section className="space-y-6">
        <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
          <h2 className="font-bebas text-4xl text-white tracking-wide flex items-center gap-2">
            <Trophy className="text-primary-yellow" /> TOURNAMENT HONOR AWARDS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Golden Boot */}
          <div className="glass-panel-gold p-6 rounded-3xl space-y-4 text-center border-2 border-primary-yellow/50 relative overflow-hidden">
            {isAdmin && (
              <button
                onClick={() => openAwardEditModal('golden_boot', defaultGoldenBoot, `${defaultGoldenBoot?.goalsScored || 0} GOALS`)}
                className="absolute top-4 right-4 p-2 bg-charcoal/90 hover:bg-primary-yellow hover:text-charcoal text-gray-300 rounded-lg border border-primary-yellow/40 transition-colors"
                title="Edit Top Goal Scorer Award"
              >
                <Edit2 size={14} />
              </button>
            )}

            <div className="w-16 h-16 rounded-2xl bg-primary-yellow/10 border border-primary-yellow/40 flex items-center justify-center mx-auto text-primary-yellow shadow-glow-yellow">
              <Flame size={32} />
            </div>
            <div>
              <span className="text-xs font-bebas text-primary-yellow uppercase tracking-widest bg-primary-yellow/10 px-3 py-1 rounded-full">
                GOLDEN BOOT
              </span>
              <h3 className="font-bebas text-3xl text-white mt-2">Top Goal Scorer</h3>
            </div>

            <div className="bg-charcoal/80 p-4 rounded-2xl border border-gray-800 space-y-2">
              <p className="font-bebas text-2xl text-primary-yellow">{goldenBoot.name}</p>
              <p className="text-xs text-gray-400">{goldenBoot.team}</p>
              <span className="inline-block font-bebas text-2xl text-vibrant-orange mt-1">
                {goldenBoot.detail}
              </span>
            </div>
          </div>

          {/* Golden Glove */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 text-center border border-teal/40 relative overflow-hidden">
            {isAdmin && (
              <button
                onClick={() => openAwardEditModal('golden_glove', defaultGoldenGlove, 'PREMIER SHOT STOPPER')}
                className="absolute top-4 right-4 p-2 bg-charcoal/90 hover:bg-teal hover:text-charcoal text-gray-300 rounded-lg border border-teal/40 transition-colors"
                title="Edit Best Goalkeeper Award"
              >
                <Edit2 size={14} />
              </button>
            )}

            <div className="w-16 h-16 rounded-2xl bg-teal/10 border border-teal/40 flex items-center justify-center mx-auto text-teal shadow-glow-cyan">
              <Award size={32} />
            </div>
            <div>
              <span className="text-xs font-bebas text-teal uppercase tracking-widest bg-teal/10 px-3 py-1 rounded-full">
                GOLDEN GLOVE
              </span>
              <h3 className="font-bebas text-3xl text-white mt-2">Best Goalkeeper</h3>
            </div>

            <div className="bg-charcoal/80 p-4 rounded-2xl border border-gray-800 space-y-2">
              <p className="font-bebas text-2xl text-teal">{goldenGlove.name}</p>
              <p className="text-xs text-gray-400">{goldenGlove.team}</p>
              <span className="inline-block font-bebas text-lg text-light-cyan mt-1">
                {goldenGlove.detail}
              </span>
            </div>
          </div>

          {/* Player of the Tournament */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 text-center border border-vibrant-orange/40 relative overflow-hidden">
            {isAdmin && (
              <button
                onClick={() => openAwardEditModal('mvp', defaultMVP, 'OUTSTANDING PERFORMER')}
                className="absolute top-4 right-4 p-2 bg-charcoal/90 hover:bg-vibrant-orange hover:text-charcoal text-gray-300 rounded-lg border border-vibrant-orange/40 transition-colors"
                title="Edit Player of Tournament Award"
              >
                <Edit2 size={14} />
              </button>
            )}

            <div className="w-16 h-16 rounded-2xl bg-vibrant-orange/10 border border-vibrant-orange/40 flex items-center justify-center mx-auto text-vibrant-orange shadow-glow-orange">
              <Crown size={32} />
            </div>
            <div>
              <span className="text-xs font-bebas text-vibrant-orange uppercase tracking-widest bg-vibrant-orange/10 px-3 py-1 rounded-full">
                MVP AWARD
              </span>
              <h3 className="font-bebas text-3xl text-white mt-2">Player of Tournament</h3>
            </div>

            <div className="bg-charcoal/80 p-4 rounded-2xl border border-gray-800 space-y-2">
              <p className="font-bebas text-2xl text-vibrant-orange">{mvpAward.name}</p>
              <p className="text-xs text-gray-400">{mvpAward.team}</p>
              <span className="inline-block font-bebas text-lg text-primary-yellow mt-1">
                {mvpAward.detail}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Top 5 Scorers Leaderboard Table */}
      <section className="space-y-6">
        <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-bebas text-4xl text-white tracking-wide flex items-center gap-2">
              <Flame className="text-vibrant-orange" /> TOP 5 GOAL SCORERS
            </h2>
            <p className="text-xs text-gray-400">Leading goal scorers of the tournament</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingScorerPlayerId('new');
                setScorerSelectedPlayerId(players[0]?.id || '');
                setScorerGoals(1);
              }}
              className="px-4 py-2 bg-primary-yellow text-charcoal font-bebas text-lg font-bold rounded-xl shadow-glow-yellow hover:opacity-90 flex items-center gap-1.5"
            >
              <UserCheck size={18} /> Select Goal Scorer
            </button>
          )}
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
                {sortedScorers.slice(0, 5).map((player, idx) => (
                  <tr key={player.id} className="hover:bg-deep-blue/40 transition-colors">
                    <td className="py-3 px-4 font-bebas text-xl text-primary-yellow">
                      #{idx + 1}
                    </td>

                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-charcoal border border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {player.photoUrl ? (
                          <img 
                            src={normalizeImageUrl(player.photoUrl)} 
                            alt={player.name} 
                            className="w-full h-full object-cover rounded-full" 
                            onError={(e) => handleImageError(e, player.photoUrl)}
                          />
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

      {/* Top-Front Modal: Select & Set Player Goals from Directory */}
      {editingScorerPlayerId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md glass-panel-gold rounded-3xl p-6 text-white space-y-4 shadow-2xl border-2 border-primary-yellow/50">
            <button
              onClick={() => setEditingScorerPlayerId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="font-bebas text-3xl text-primary-yellow">Select Goal Scorer from Directory</h3>

            <form onSubmit={handleSaveScorerGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Select Player from Directory</label>
                <select
                  value={scorerSelectedPlayerId}
                  onChange={(e) => {
                    setScorerSelectedPlayerId(e.target.value);
                    const sel = players.find(p => p.id === e.target.value);
                    if (sel) setScorerGoals(sel.goalsScored || 1);
                  }}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                  required
                >
                  <option value="">-- Select Player --</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.teamName || 'No Team'}) - Currently {p.goalsScored || 0} goals</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Total Goals Scored</label>
                <input
                  type="number"
                  min="0"
                  value={scorerGoals}
                  onChange={(e) => setScorerGoals(Number(e.target.value))}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-primary-yellow font-bebas text-xl focus:border-primary-yellow focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingScorerPlayerId(null)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-bebas text-lg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-yellow text-charcoal font-bebas text-xl font-bold rounded-xl shadow-glow-yellow"
                >
                  Update Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Honor Award Modal */}
      {editingAwardKey && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md glass-panel-gold rounded-3xl p-6 text-white space-y-4 shadow-2xl border-2 border-primary-yellow/50">
            <button
              onClick={() => setEditingAwardKey(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="font-bebas text-3xl text-primary-yellow">Edit Honor Award Details</h3>

            <form onSubmit={handleSaveAward} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Select from Player List (Optional)</label>
                <select
                  onChange={(e) => {
                    const sel = players.find(p => p.id === e.target.value);
                    if (sel) {
                      setEditRecipientName(sel.name);
                      setEditRecipientTeam(sel.teamName || 'Unassigned');
                    }
                  }}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-yellow focus:outline-none mb-2"
                >
                  <option value="">-- Choose Existing Player --</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.teamName || 'No Team'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Winner / Recipient Name</label>
                <input
                  type="text"
                  value={editRecipientName}
                  onChange={(e) => setEditRecipientName(e.target.value)}
                  placeholder="e.g. Shakib Ahmed"
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Team Name</label>
                <input
                  type="text"
                  value={editRecipientTeam}
                  onChange={(e) => setEditRecipientTeam(e.target.value)}
                  placeholder="e.g. Circuit Breakers"
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Award Detail / Highlight Text</label>
                <input
                  type="text"
                  value={editDetail}
                  onChange={(e) => setEditDetail(e.target.value)}
                  placeholder="e.g. 5 GOALS or PREMIER SHOT STOPPER"
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAwardKey(null)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-bebas text-lg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-yellow text-charcoal font-bebas text-xl font-bold rounded-xl shadow-glow-yellow"
                >
                  Save Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
