'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Player, PlayerPosition } from '@/types';
import { Crown, Lock, CheckCircle2, Shield, User, Wallet, Edit2, X } from 'lucide-react';

const getGoogleDriveFileId = (value: string) => {
  const match = value.match(/(?:\/file\/d\/|[?&]id=|\/uc\?id=)([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
};

const normalizeImageUrl = (value: unknown) => {
  if (typeof value !== 'string') return undefined;

  const url = value.trim();
  if (!url) return undefined;

  const fileId = getGoogleDriveFileId(url);
  return fileId
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    : url;
};

export default function IconPlayersPage() {
  const { isAdmin, teams, players, assignIconPlayer, updatePlayer } = useApp();

  // State for inline assignment forms for each icon player
  const [inlinePrice, setInlinePrice] = useState<Record<string, number>>({});
  const [inlineTeam, setInlineTeam] = useState<Record<string, string>>({});
  const [inlineError, setInlineError] = useState<Record<string, string>>({});

  // State for editing icon player modal
  const [editingIcon, setEditingIcon] = useState<Player | null>(null);

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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIcon) return;

    updatePlayer({
      ...editingIcon,
      photoUrl: normalizeImageUrl(editingIcon.photoUrl)
    });
    setEditingIcon(null);
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
            <p className="text-xs text-light-cyan font-montserrat">Inline Pre-Auction Marquee Player Assignment & Editable Details</p>
          </div>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-charcoal/80 px-4 py-2 rounded-xl border border-gray-700">
            <Lock size={16} className="text-primary-yellow" />
            <span>Admin Mode required to assign & edit icons</span>
          </div>
        )}
      </div>

      {/* Grid of Icon Cards */}
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
              {/* Badge & Edit button */}
              <div className="flex items-center justify-between">
                <span className="bg-gradient-to-r from-primary-yellow to-vibrant-orange text-charcoal font-bebas text-xs px-3 py-1 rounded-md font-bold shadow-glow-yellow flex items-center gap-1">
                  <Crown size={14} /> GOLD ICON
                </span>
                
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => setEditingIcon(iconP)}
                      className="px-2.5 py-1 bg-charcoal/90 hover:bg-primary-yellow hover:text-charcoal text-gray-300 font-bebas text-xs rounded-md border border-gray-700 transition-colors flex items-center gap-1"
                      title="Edit Icon Player Details"
                    >
                      <Edit2 size={12} /> Edit Info
                    </button>
                  )}

                  {isAssigned && (
                    <span className="bg-teal/20 text-teal border border-teal/40 font-bebas text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                      <CheckCircle2 size={12} /> LOCKED
                    </span>
                  )}
                </div>
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

      {/* Edit Icon Player Modal */}
      {editingIcon && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md glass-panel-gold rounded-3xl p-6 text-white space-y-4 shadow-2xl border-2 border-primary-yellow/50">
            <button
              onClick={() => setEditingIcon(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 border-b border-primary-yellow/30 pb-3">
              <Crown className="text-primary-yellow w-6 h-6" />
              <h3 className="font-bebas text-3xl text-primary-yellow">Edit Icon Player</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingIcon.name}
                  onChange={(e) => setEditingIcon({ ...editingIcon, name: e.target.value })}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Roll No.</label>
                  <input
                    type="text"
                    value={editingIcon.roll}
                    onChange={(e) => setEditingIcon({ ...editingIcon, roll: e.target.value })}
                    className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Series</label>
                  <select
                    value={editingIcon.series}
                    onChange={(e) => setEditingIcon({ ...editingIcon, series: e.target.value })}
                    className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-yellow focus:outline-none"
                  >
                    <option value="19 Series">19 Series</option>
                    <option value="20 Series">20 Series</option>
                    <option value="21 Series">21 Series</option>
                    <option value="22 Series">22 Series</option>
                    <option value="23 Series">23 Series</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Position</label>
                <select
                  value={editingIcon.position}
                  onChange={(e) => setEditingIcon({ ...editingIcon, position: e.target.value as PlayerPosition })}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-yellow focus:outline-none"
                >
                  <option value="FORWARD">FORWARD</option>
                  <option value="MIDFIELDER">MIDFIELDER</option>
                  <option value="DEFENDER">DEFENDER</option>
                  <option value="GOALKEEPER">GOALKEEPER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Photo / Image URL (Google Drive Link)
                </label>
                <input
                  type="text"
                  value={editingIcon.photoUrl || ''}
                  onChange={(e) => setEditingIcon({ ...editingIcon, photoUrl: e.target.value })}
                  placeholder="Paste Google Drive image link..."
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-yellow focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingIcon(null)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-bebas text-lg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-yellow text-charcoal font-bebas text-xl font-bold rounded-xl shadow-glow-yellow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
