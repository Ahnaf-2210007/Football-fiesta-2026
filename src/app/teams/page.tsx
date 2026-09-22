'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TeamCard } from '@/components/TeamCard';
import { Shield, Lock, UserPlus, X } from 'lucide-react';

export default function TeamsPage() {
  const { isAdmin, teams, players, addTeam } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [owner, setOwner] = useState('');
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [color, setColor] = useState('#00B3A4');

  const handleAddTeam = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !shortName.trim() || !owner.trim()) return;
    addTeam({ id: `team-${Date.now()}`, name: name.trim(), shortName: shortName.trim().toUpperCase(), owner: owner.trim(), ownerPhotoUrl: ownerPhotoUrl.trim() || undefined, logoUrl: logoUrl.trim() || undefined, color, startingPurse: 1500, spentPurse: 0, maxSquadSize: 11 });
    setName(''); setShortName(''); setOwner(''); setOwnerPhotoUrl(''); setLogoUrl(''); setColor('#00B3A4'); setIsAddOpen(false);
  };

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
          {isAdmin && (
            <button onClick={() => setIsAddOpen(true)} className="px-4 py-2.5 bg-primary-yellow text-charcoal font-bebas text-lg font-bold rounded-xl flex items-center gap-2">
              <UserPlus size={18} /> Add Team
            </button>
          )}
        </div>
      </div>

      {/* Grid of 6 Team Cards */}
      <div className="grid grid-cols-1 gap-8">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            players={players}
            editable={true}
          />
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md glass-panel-gold rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <button onClick={() => setIsAddOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h3 className="font-bebas text-3xl text-primary-yellow">Add Team</h3>
            <form onSubmit={handleAddTeam} className="space-y-4">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Team name" required className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white" />
              <input value={shortName} onChange={e => setShortName(e.target.value)} placeholder="Short name" required className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white" />
              <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="Owner / manager name" required className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white" />
              <input value={ownerPhotoUrl} onChange={e => setOwnerPhotoUrl(e.target.value)} placeholder="Manager image URL (Google Drive / web)" className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white" />
              <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Team logo URL (optional)" className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white" />
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 bg-deep-blue border border-gray-700 rounded-xl cursor-pointer p-1" />
              <button type="submit" className="w-full py-2.5 bg-primary-yellow text-charcoal font-bebas text-xl font-bold rounded-xl">Create Team</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
