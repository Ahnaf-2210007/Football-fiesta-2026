'use client';

import React, { useState } from 'react';
import { Team, Player } from '../types';
import { useApp } from '../context/AppContext';
import { normalizeImageUrl, handleImageError } from '../utils/imageUtils';
import { Shield, Users, Edit2, User, Crown, X } from 'lucide-react';

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
  const [editOwnerPhoto, setEditOwnerPhoto] = useState(team.ownerPhotoUrl || '');
  const [editLogo, setEditLogo] = useState(team.logoUrl || '');
  const [editColor, setEditColor] = useState(team.color);

  const teamPlayers = players.filter(p => p.teamId === team.id);
  const iconPlayer = teamPlayers.find(p => p.isIcon);
  const auctionPlayers = teamPlayers.filter(p => !p.isIcon);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeam({
      ...team,
      name: editName,
      owner: editOwner,
      ownerPhotoUrl: normalizeImageUrl(editOwnerPhoto),
      logoUrl: normalizeImageUrl(editLogo),
      color: editColor
    });
    setIsEditing(false);
  };

  const managerPhoto = normalizeImageUrl(team.ownerPhotoUrl);
  const logoUrl = normalizeImageUrl(team.logoUrl);

  return (
    <div 
      className="glass-panel rounded-3xl overflow-hidden transition-all duration-300 hover:border-primary-yellow/50 hover:shadow-2xl relative group"
      style={{ borderTop: `4px solid ${team.color}` }}
    >
      {/* Header Info */}
      <div className="p-6 bg-gradient-to-b from-deep-blue/90 to-charcoal/90 space-y-4">
        <div className="flex items-start justify-between gap-4">
          
          {/* Logo & Team Title */}
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl overflow-hidden bg-charcoal border-2 flex items-center justify-center shrink-0 shadow-md"
              style={{ borderColor: team.color }}
            >
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={team.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => handleImageError(e, team.logoUrl)}
                />
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
              {team.group && (
                <span className="inline-block text-[10px] font-bebas px-2 py-0.5 rounded mt-0.5 bg-vibrant-orange/20 text-vibrant-orange border border-vibrant-orange/40">
                  Group {team.group}
                </span>
              )}
            </div>
          </div>

          {isAdmin && editable && (
            <button
              onClick={() => {
                setEditName(team.name);
                setEditOwner(team.owner);
                setEditOwnerPhoto(team.ownerPhotoUrl || '');
                setEditLogo(team.logoUrl || '');
                setEditColor(team.color);
                setIsEditing(true);
              }}
              className="p-2 bg-charcoal/90 hover:bg-primary-yellow hover:text-charcoal text-gray-300 rounded-xl border border-gray-700 transition-colors shadow-md shrink-0"
              title="Edit Team & Manager Info"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {/* Manager Banner Showcase */}
        <div className="flex items-center gap-3 bg-charcoal/90 p-3 rounded-2xl border border-gray-800">
          <div className="w-12 h-12 rounded-xl bg-deep-blue border border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
            {managerPhoto ? (
              <img 
                src={managerPhoto} 
                alt={team.owner} 
                className="w-full h-full object-cover" 
                onError={(e) => handleImageError(e, team.ownerPhotoUrl)}
              />
            ) : (
              <User size={22} className="text-gray-400" />
            )}
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Team Manager</span>
            <p className="text-sm font-bold text-white">{team.owner}</p>
          </div>
        </div>

        {/* Squad Count Header Bar */}
        <div className="flex items-center justify-between bg-charcoal/60 px-4 py-2.5 rounded-xl border border-gray-800/80">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-teal" />
            <span className="text-xs text-gray-300 font-semibold uppercase">Squad Roster</span>
          </div>
          <p className="font-bebas text-xl tracking-wide text-light-cyan">
            {teamPlayers.length} / {team.maxSquadSize} Players
          </p>
        </div>
      </div>

      {/* Roster Breakdown with Player Photos & Names */}
      <div className="p-6 border-t border-gray-800/80 space-y-4">
        
        {/* Icon Player Section */}
        <div>
          <h4 className="text-xs font-semibold text-primary-yellow uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Icon Player</span>
            <span className="bg-primary-yellow/20 text-primary-yellow px-1.5 py-0.5 rounded text-[10px] font-bebas">GOLD ICON</span>
          </h4>

          {iconPlayer ? (
            <div className="flex items-center gap-3 bg-gradient-to-r from-primary-yellow/10 to-transparent p-2.5 rounded-xl border border-primary-yellow/30">
              <div className="w-10 h-10 rounded-lg bg-charcoal border border-primary-yellow overflow-hidden flex items-center justify-center shrink-0">
                {iconPlayer.photoUrl ? (
                  <img 
                    src={normalizeImageUrl(iconPlayer.photoUrl)} 
                    alt={iconPlayer.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => handleImageError(e, iconPlayer.photoUrl)}
                  />
                ) : (
                  <User size={18} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white leading-tight">{iconPlayer.name}</p>
                <p className="text-[10px] text-gray-400">{iconPlayer.roll} • {iconPlayer.position}</p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl border border-dashed border-gray-700 text-center text-xs text-gray-500">
              No Icon Player Assigned
            </div>
          )}
        </div>

        {/* Auctioned Roster Section */}
        <div>
          <h4 className="text-xs font-semibold text-light-cyan uppercase tracking-wider mb-2">
            Auctioned Squad ({auctionPlayers.length}/9)
          </h4>

          {auctionPlayers.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {auctionPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2 bg-charcoal/70 hover:bg-deep-blue/70 rounded-xl text-xs transition-colors border border-gray-800">
                  <div className="w-9 h-9 rounded-lg bg-charcoal border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                    {p.photoUrl ? (
                      <img 
                        src={normalizeImageUrl(p.photoUrl)} 
                        alt={p.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, p.photoUrl)}
                      />
                    ) : (
                      <User size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{p.roll} • {p.position}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic text-center py-3">No players acquired from live auction pool yet</p>
          )}
        </div>
      </div>

      {/* Top-Front Admin Edit Team Modal Popup */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md glass-panel-gold rounded-3xl p-6 text-white space-y-4 shadow-2xl border-2 border-primary-yellow/50">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="font-bebas text-3xl text-primary-yellow">Edit Team & Manager Info</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Team Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Manager / Owner Name</label>
                <input
                  type="text"
                  value={editOwner}
                  onChange={e => setEditOwner(e.target.value)}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Manager Photo Link (Google Drive / Web URL)</label>
                <input
                  type="text"
                  value={editOwnerPhoto}
                  onChange={e => setEditOwnerPhoto(e.target.value)}
                  placeholder="Paste manager image link..."
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Team Logo URL</label>
                <input
                  type="text"
                  value={editLogo}
                  onChange={e => setEditLogo(e.target.value)}
                  placeholder="Paste team logo image link..."
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Theme Color</label>
                <input
                  type="color"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  className="w-full h-10 bg-deep-blue border border-gray-700 rounded-xl cursor-pointer p-1"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-bebas text-lg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-yellow text-charcoal font-bebas text-xl font-bold rounded-xl shadow-glow-yellow"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
