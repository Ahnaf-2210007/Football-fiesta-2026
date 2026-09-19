'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Crown, Lock, CheckCircle2, Shield, User, Wallet } from 'lucide-react';

export default function IconPlayersPage() {
  const { isAdmin, teams, players, assignIconPlayer } = useApp();

  // State for inline assignment forms for each icon player
  const [inlinePrice, setInlinePrice] = useState<Record<string, number>>({});
  const [inlineTeam, setInlineTeam] = useState<Record<string, string>>({});
  const [inlineError, setInlineError] = useState<Record<string, string>>({});

  const iconPlayers = players.filter(p => p.isIcon);

  const handleAssign = (playerId: string) => {
    const price = inlinePrice[playerId] || 150;
    const teamId = inlineTeam[playerId];

    if (!teamId) {
      setInlineError(prev => ({ ...prev, [playerId]: 'Please select a team from the dropdown.' }));
      return;
    }

    setInlineError(prev => ({ ...prev, [playerId]: '' }));
    assignIconPlayer(playerId, teamId, price);
  };

  return (
    <div className="visual-rally rally-icons max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-primary-yellow to-vibrant-orange rounded-xl text-charcoal shadow-glow-yellow">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-bebas text-5xl text-white tracking-wide">DESIGNATED ICON PLAYERS</h1>
            <p className="text-xs text-light-cyan font-montserrat">Inline Pre-Auction Marquee Player Assignment & Team Lock</p>
          </div>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-charcoal/80 px-4 py-2 rounded-xl border border-gray-700">
            <Lock size={16} className="text-primary-yellow" />
            <span>Admin Mode required to assign icons</span>
          </div>
        )}
      </div>

      {/* Grid of 6 Icon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {iconPlayers.map((iconP) => {
          const isAssigned = !!iconP.teamId;

          return (
            <div
              key={iconP.id}
              className={`glass-panel-gold rounded-3xl p-6 space-y-6 relative overflow-hidden transition-all ${
                isAssigned ? 'border-primary-yellow/60' : 'border-gray-800'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span className="bg-gradient-to-r from-primary-yellow to-vibrant-orange text-charcoal font-bebas text-xs px-3 py-1 rounded-md font-bold shadow-glow-yellow flex items-center gap-1">
                  <Crown size={14} /> GOLD ICON
                </span>
                
                {isAssigned && (
                  <span className="bg-teal/20 text-teal border border-teal/40 font-bebas text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                    <CheckCircle2 size={12} /> LOCKED
                  </span>
                )}
              </div>

              {/* Player Info */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-charcoal border-2 border-primary-yellow overflow-hidden shrink-0 shadow-md">
                  {iconP.photoUrl ? (
                    <img src={iconP.photoUrl} alt={iconP.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400 m-auto mt-4" />
                  )}
                </div>

                <div>
                  <h3 className="font-bebas text-3xl text-white tracking-wide">{iconP.name}</h3>
                  <p className="text-xs text-gray-400">Roll: <span className="text-primary-yellow font-mono">{iconP.roll}</span> • {iconP.series}</p>
                  <span className="inline-block mt-1 text-[11px] font-bebas px-2 py-0.5 rounded bg-vibrant-orange/20 text-vibrant-orange border border-vibrant-orange/30">
                    {iconP.position}
                  </span>
                </div>
              </div>

              {/* Assignment Info or Admin Inline Controls */}
              {isAssigned ? (
                <div className="bg-charcoal/80 p-4 rounded-2xl border border-primary-yellow/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Assigned Team:</span>
                    <span className="font-bebas text-xl text-primary-yellow flex items-center gap-1">
                      <Shield size={16} /> {iconP.teamName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-gray-800 pt-2">
                    <span className="text-gray-400">Icon Price Deduction:</span>
                    <span className="font-bebas text-xl text-vibrant-orange">{iconP.soldPrice || 0} TK</span>
                  </div>
                </div>
              ) : isAdmin ? (
                <div className="bg-charcoal/90 p-4 rounded-2xl border border-gray-700 space-y-3">
                  <h4 className="font-bebas text-xl text-primary-yellow flex items-center gap-1.5">
                    <Wallet size={18} /> Inline Icon Assignment
                  </h4>

                  <div>
                    <label className="block text-[11px] text-gray-400 uppercase mb-1">Select Team</label>
                    <select
                      value={inlineTeam[iconP.id] || ''}
                      onChange={(e) => setInlineTeam({ ...inlineTeam, [iconP.id]: e.target.value })}
                      className="w-full bg-deep-blue border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-primary-yellow focus:outline-none"
                    >
                      <option value="">-- Choose Team --</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 uppercase mb-1">Icon Price (TK)</label>
                    <input
                      type="number"
                      step="10"
                      min="50"
                      value={inlinePrice[iconP.id] ?? 150}
                      onChange={(e) => setInlinePrice({ ...inlinePrice, [iconP.id]: Number(e.target.value) })}
                      className="w-full bg-deep-blue border border-gray-700 rounded-lg px-3 py-2 text-xs text-primary-yellow font-bebas text-lg focus:border-primary-yellow focus:outline-none"
                    />
                  </div>

                  {inlineError[iconP.id] && (
                    <p className="text-fiery-red text-[11px]">{inlineError[iconP.id]}</p>
                  )}

                  <button
                    onClick={() => handleAssign(iconP.id)}
                    className="w-full py-2.5 bg-gradient-to-r from-primary-yellow via-vibrant-orange to-fiery-red text-charcoal font-bebas text-lg font-bold rounded-xl shadow-glow-yellow hover:opacity-90 transition-all"
                  >
                    Confirm Icon Lock & Assign
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-gray-700 text-center text-xs text-gray-500 italic">
                  Awaiting Admin Icon Lock Assignment
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
