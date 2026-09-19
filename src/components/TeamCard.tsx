'use client';

import React, { useState } from 'react';
import { Team, Player } from '../types';
import { useApp } from '../context/AppContext';
import { Shield, Users, Wallet, Edit2, Check, X, Image as ImageIcon } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  players: Player[];
  editable?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, players, editable = false }) => {
  const { isAdmin, updateTeam } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [editOwner, setEditOwner] = useState(team.owner);
  const [editLogo, setEditLogo] = useState(team.logoUrl || '');
  const [editPurse, setEditPurse] = useState(team.startingPurse);
  const [editColor, setEditColor] = useState(team.color);

  const teamPlayers = players.filter(p => p.teamId === team.id);
  const iconPlayer = teamPlayers.find(p => p.isIcon);
  const auctionPlayers = teamPlayers.filter(p => !p.isIcon);
  
  const totalSpent = teamPlayers.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
  const remainingPurse = team.startingPurse - totalSpent;

  const handleSave = () => {
    updateTeam({
      ...team,
      name: editName,
      owner: editOwner,
      logoUrl: editLogo,
      startingPurse: editPurse,
      color: editColor
    });
    setIsEditing(false);
  };

  return (
    <div 
      className="glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary-yellow/40 hover:shadow-xl relative group"
      style={{ borderTop: `4px solid ${team.color}` }}
    >
      {/* Header Info */}
      <div className="p-6 bg-gradient-to-b from-deep-blue/90 to-charcoal/90">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-xl overflow-hidden bg-charcoal border-2 flex items-center justify-center shrink-0 shadow-md"
              style={{ borderColor: team.color }}
            >
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-9 h-9" style={{ color: team.color }} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bebas text-3xl tracking-wide text-white">{team.name}</h3>
                <span className="text-xs font-bebas px-2 py-0.5 rounded bg-deep-blue text-light-cyan border border-light-cyan/30">
                  {team.shortName}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-montserrat">Manager: <span className="text-gray-200 font-semibold">{team.owner}</span></p>
              {team.group && (
                <span className="inline-block text-[10px] font-bebas px-2 py-0.5 rounded mt-1 bg-vibrant-orange/20 text-vibrant-orange border border-vibrant-orange/40">
                  Group {team.group}
                </span>
              )}
            </div>
          </div>

          {isAdmin && editable && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-charcoal/80 hover:bg-primary-yellow hover:text-charcoal text-gray-300 rounded-lg border border-gray-700 transition-colors"
              title="Edit Team Details"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {/* Edit Modal / Form overlay if editing */}
        {isEditing && (
          <div className="mb-4 p-4 bg-charcoal/95 border border-primary-yellow/40 rounded-xl space-y-3">
            <h4 className="font-bebas text-xl text-primary-yellow">Edit Team Settings</h4>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Team Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full bg-deep-blue border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Manager / Owner Name</label>
              <input
                type="text"
                value={editOwner}
                onChange={e => setEditOwner(e.target.value)}
                className="w-full bg-deep-blue border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Logo URL</label>
              <input
                type="text"
                value={editLogo}
                onChange={e => setEditLogo(e.target.value)}
                className="w-full bg-deep-blue border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 block mb-1">Starting Purse (TK)</label>
                <input
                  type="number"
                  value={editPurse}
                  onChange={e => setEditPurse(Number(e.target.value))}
                  className="w-full bg-deep-blue border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 block mb-1">Theme Color</label>
                <input
                  type="color"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  className="w-full h-9 bg-deep-blue border border-gray-700 rounded cursor-pointer"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-800 text-xs text-gray-300 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1 bg-primary-yellow text-charcoal font-bebas text-base font-bold rounded hover:opacity-90"
              >
                Save Team
              </button>
            </div>
          </div>
        )}

        {/* Purse & Squad Stats Grid */}
        <div className="grid grid-cols-3 gap-3 bg-charcoal/80 p-3 rounded-xl border border-gray-800/80">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <Wallet size={12} className="text-primary-yellow" /> Purse Remaining
            </span>
            <p className={`font-bebas text-2xl tracking-wide ${remainingPurse < 0 ? 'text-fiery-red font-bold' : 'text-primary-yellow'}`}>
              {remainingPurse} <span className="text-xs">TK</span>
            </p>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Spent</span>
            <p className="font-bebas text-2xl tracking-wide text-vibrant-orange">
              {totalSpent} <span className="text-xs">TK</span>
            </p>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <Users size={12} className="text-teal" /> Squad
            </span>
            <p className="font-bebas text-2xl tracking-wide text-light-cyan">
              {teamPlayers.length} / {team.maxSquadSize}
            </p>
          </div>
        </div>
      </div>

      {/* Roster Breakdown */}
      <div className="p-6 border-t border-gray-800/80 space-y-4">
        {/* Icon Player */}
        <div>
          <h4 className="text-xs font-semibold text-primary-yellow uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Icon Player</span>
            <span className="bg-primary-yellow/20 text-primary-yellow px-1.5 py-0.5 rounded text-[10px] font-bebas">GOLD ICON</span>
          </h4>

          {iconPlayer ? (
            <div className="flex items-center justify-between bg-gradient-to-r from-primary-yellow/10 to-transparent p-2.5 rounded-lg border border-primary-yellow/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-yellow shadow-glow-yellow"></span>
                <div>
                  <p className="text-sm font-bold text-white">{iconPlayer.name}</p>
                  <p className="text-[10px] text-gray-400">{iconPlayer.roll} • {iconPlayer.position}</p>
                </div>
              </div>
              <span className="font-bebas text-lg text-primary-yellow">{iconPlayer.soldPrice || 0} TK</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg border border-dashed border-gray-700 text-center text-xs text-gray-500">
              No Icon Player Assigned Yet
            </div>
          )}
        </div>

        {/* Auctioned Roster */}
        <div>
          <h4 className="text-xs font-semibold text-light-cyan uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Auctioned Players ({auctionPlayers.length}/9)</span>
          </h4>

          {auctionPlayers.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {auctionPlayers.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-charcoal/60 hover:bg-deep-blue/60 rounded-lg text-xs transition-colors">
                  <div>
                    <span className="font-semibold text-gray-200">{p.name}</span>
                    <span className="text-[10px] text-gray-400 ml-2">({p.position})</span>
                  </div>
                  <span className="font-bebas text-base text-vibrant-orange">{p.soldPrice} TK</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic text-center py-2">No players acquired from live auction pool yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
