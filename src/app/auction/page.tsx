'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { normalizeImageUrl, handleImageError } from '@/utils/imageUtils';
import { 
  Gavel, 
  Crown, 
  User, 
  CheckCircle2, 
  XCircle, 
  Shuffle, 
  Lock, 
  Info,
  DollarSign,
  Shield
} from 'lucide-react';

export default function AuctionStagePage() {
  const { 
    isAdmin, 
    teams, 
    players, 
    currentStagePlayer, 
    drawNextRandomPlayer, 
    markPlayerSold, 
    markPlayerUnsold 
  } = useApp();

  const [mounted, setMounted] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [bidPrice, setBidPrice] = useState<number>(50);
  const [biddingError, setBiddingError] = useState<string>('');
  const [isProjectorView, setIsProjectorView] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openProjectorFullscreen = () => {
    setIsProjectorView(true);
    if (typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const closeProjectorFullscreen = () => {
    setIsProjectorView(false);
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const unsoldPlayers = players.filter(p => !p.isIcon && (p.status === 'AVAILABLE' || p.status === 'UNSOLD') && !p.teamId);
  const soldPlayersCount = players.filter(p => p.status === 'SOLD').length;

  const handleDrawNext = () => {
    setBiddingError('');
    const drawn = drawNextRandomPlayer();
    if (drawn) {
      setBidPrice(50);
      setSelectedTeamId('');
    }
  };

  const handleMarkSold = (e: React.FormEvent) => {
    e.preventDefault();
    setBiddingError('');

    if (!currentStagePlayer) return;
    if (!selectedTeamId) {
      setBiddingError('Please select the winning purchasing team from the dropdown.');
      return;
    }

    const team = teams.find(t => t.id === selectedTeamId);
    if (!team) return;

    const teamSpent = players.filter(p => p.teamId === team.id).reduce((sum, p) => sum + (p.soldPrice || 0), 0);
    const teamRemaining = team.startingPurse - teamSpent;

    if (bidPrice > teamRemaining) {
      setBiddingError(`Bidding price (${bidPrice} TK) exceeds ${team.name}'s remaining budget (${teamRemaining} TK).`);
      return;
    }

    markPlayerSold(currentStagePlayer.id, selectedTeamId, bidPrice);
    setBidPrice(50);
    setSelectedTeamId('');
  };

  const handleMarkUnsold = () => {
    if (!currentStagePlayer) return;
    markPlayerUnsold(currentStagePlayer.id);
    setBidPrice(50);
    setSelectedTeamId('');
  };

  return (
    <div className="visual-rally rally-auction max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-primary-yellow to-vibrant-orange rounded-xl text-charcoal shadow-glow-yellow">
              <Gavel className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-bebas text-5xl text-white tracking-wide">LIVE AUCTION STAGE</h1>
              <p className="text-xs text-light-cyan font-montserrat">Central Projector Bidding View & Offline Bidding Logger</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-deep-blue border border-light-cyan/30 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] text-gray-400 uppercase block font-semibold">Available Pool</span>
            <span className="font-bebas text-2xl text-primary-yellow">{unsoldPlayers.length} Players Left</span>
          </div>

          <div className="bg-deep-blue border border-teal/30 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] text-gray-400 uppercase block font-semibold">Sold Auctioned</span>
            <span className="font-bebas text-2xl text-teal">{soldPlayersCount} Sold</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Projector Stage & Team Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Central Projector Player Display (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel-gold rounded-3xl p-8 sm:p-10 border-2 border-primary-yellow/50 relative overflow-hidden shadow-2xl">
            
            {/* Draw Automation Controls */}
            <div className="flex items-center justify-between mb-8 border-b border-primary-yellow/20 pb-4">
              <button
                onClick={openProjectorFullscreen}
                className="px-4 py-2 text-xs font-bebas text-primary-yellow bg-primary-yellow/10 hover:bg-primary-yellow/20 rounded-full border border-primary-yellow/40 transition-all flex items-center gap-2"
              >
                <span>📽️ PROJECTOR STAGE VIEW</span>
              </button>

              {isAdmin ? (
                !currentStagePlayer ? (
                  <button
                    onClick={handleDrawNext}
                    disabled={unsoldPlayers.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-primary-yellow via-vibrant-orange to-fiery-red text-charcoal font-bebas text-xl font-bold tracking-wider rounded-xl shadow-glow-yellow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Shuffle size={20} />
                    <span>Call First Player</span>
                  </button>
                ) : null
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-charcoal/80 px-3 py-1.5 rounded-lg border border-gray-700">
                  <Lock size={14} className="text-primary-yellow" />
                  <span>Admin Bidding Control Locked</span>
                </div>
              )}
            </div>

            {/* Current Stage Player Details */}
            {currentStagePlayer ? (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  
                  {/* Photo / Avatar */}
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-charcoal border-4 border-primary-yellow overflow-hidden shadow-glow-yellow flex items-center justify-center shrink-0 relative">
                    {currentStagePlayer.photoUrl ? (
                      <img 
                        src={normalizeImageUrl(currentStagePlayer.photoUrl)} 
                        alt={currentStagePlayer.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => handleImageError(e, currentStagePlayer.photoUrl)}
                      />
                    ) : (
                      <User className="w-24 h-24 text-gray-400" />
                    )}
                  </div>

                  {/* High Visibility Information */}
                  <div className="space-y-3 text-center sm:text-left">
                    <span className="inline-block bg-fiery-red/20 text-fiery-red border border-fiery-red/40 font-bebas text-base px-3 py-1 rounded-md">
                      {currentStagePlayer.position}
                    </span>
                    <h2 className="font-bebas text-5xl sm:text-6xl text-white tracking-wide leading-none">
                      {currentStagePlayer.name}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-gray-300 font-montserrat text-sm">
                      <p>Roll: <span className="text-primary-yellow font-mono text-base font-bold">{currentStagePlayer.roll}</span></p>
                      <p>Series: <span className="text-light-cyan font-semibold">{currentStagePlayer.series}</span></p>
                    </div>
                  </div>
                </div>

                {/* Bidding Controls Form for Admin */}
                {isAdmin && (
                  <form onSubmit={handleMarkSold} className="mt-8 pt-6 border-t border-primary-yellow/30 space-y-4 bg-charcoal/90 p-6 rounded-2xl border border-gray-800">
                    <h3 className="font-bebas text-2xl text-primary-yellow flex items-center gap-2">
                      <DollarSign size={22} />
                      <span>Log Final Bidding Result</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-300 uppercase font-semibold mb-2">
                          Winning Purchasing Team
                        </label>
                        <select
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-yellow focus:outline-none"
                          required
                        >
                          <option value="">-- Select Team --</option>
                          {teams.map(t => {
                            const squadCount = players.filter(p => p.teamId === t.id).length;
                            return (
                              <option key={t.id} value={t.id}>
                                {t.name} ({squadCount}/9 Players)
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 uppercase font-semibold mb-2">
                          Final Sold Price (TK)
                        </label>
                        <input
                          type="number"
                          step="10"
                          min="50"
                          value={bidPrice}
                          onChange={(e) => setBidPrice(Number(e.target.value))}
                          className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-3 text-white font-bebas text-xl text-primary-yellow focus:border-primary-yellow focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {biddingError && (
                      <p className="text-fiery-red text-xs bg-fiery-red/10 border border-fiery-red/30 p-2.5 rounded-lg">
                        {biddingError}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={handleMarkUnsold}
                        className="flex-1 py-3.5 bg-fiery-red/80 hover:bg-fiery-red text-white font-bebas text-xl rounded-xl transition-all shadow-glow-red flex items-center justify-center gap-2"
                      >
                        <XCircle size={20} />
                        <span>Mark Unsold</span>
                      </button>

                      <button
                        type="submit"
                        className="flex-2 py-3.5 bg-gradient-to-r from-teal to-light-cyan hover:opacity-95 text-charcoal font-bebas text-2xl font-bold tracking-wider rounded-xl transition-all shadow-glow-cyan flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={22} />
                        <span>Confirm Sold & Next Player</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <Crown className="w-16 h-16 text-primary-yellow/40 mx-auto animate-bounce" />
                <h3 className="font-bebas text-4xl text-gray-300">STAGE IS EMPTY</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Click <strong className="text-primary-yellow">"Call First Player"</strong> to draw an unsold player from the regular pool onto the stage.
                </p>

                {isAdmin && (
                  <button
                    onClick={handleDrawNext}
                    className="mt-4 px-8 py-4 bg-primary-yellow text-charcoal font-bebas text-2xl font-bold rounded-xl shadow-glow-yellow hover:scale-105 transition-transform"
                  >
                    Call First Player
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bidding Rules Quick Guide */}
          <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
            <Info className="w-6 h-6 text-light-cyan shrink-0 mt-1" />
            <div className="space-y-1 text-xs text-gray-300">
              <h4 className="font-bebas text-lg text-light-cyan">Auction Bidding Rules Overview</h4>
              <p>Base price: <strong className="text-primary-yellow">50 TK</strong> | Increments: <strong className="text-white">+10 TK</strong> (&lt;100 TK), <strong className="text-white">+20 TK</strong> (100–200 TK), <strong className="text-white">Hidden Bid</strong> (&gt;200 TK).</p>
            </div>
          </div>
        </div>

        {/* Live Team Roster Tracker (1 col) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Shield className="text-light-cyan w-6 h-6" />
              <h3 className="font-bebas text-3xl text-white">LIVE TEAM SQUADS</h3>
            </div>

            <div className="space-y-3">
              {teams.map((team) => {
                const teamPlayers = players.filter(p => p.teamId === team.id);
                const spent = teamPlayers.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
                const remainingPurse = team.startingPurse - spent;

                return (
                  <div key={team.id} className="p-4 bg-charcoal/80 rounded-xl border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                        <span className="font-bebas text-xl text-white">{team.name}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-montserrat">Manager: {team.owner}</p>
                    </div>

                    <div className="text-right">
                      {isAdmin && (
                        <div className="mb-1">
                          <span className="font-bebas text-xl text-primary-yellow">
                            {remainingPurse} TK
                          </span>
                          <span className="text-[9px] block text-gray-400 font-semibold uppercase">Purse Left</span>
                        </div>
                      )}
                      <span className="font-bebas text-lg text-teal">
                        {teamPlayers.length}/9 Players
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Projector Stage View Fullscreen Overlay */}
      {isProjectorView && (
        <div className="fixed inset-0 z-50 bg-[#070e17] flex flex-col items-center justify-center p-6 text-white backdrop-blur-xl animate-fade-in overflow-y-auto">
          {/* Top Bar Header */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between border-b border-primary-yellow/30 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-fiery-red animate-ping" />
              <h2 className="font-bebas text-3xl tracking-wider text-primary-yellow">PROJECTOR STAGE VIEW</h2>
            </div>
            <button
              onClick={closeProjectorFullscreen}
              className="px-5 py-2.5 bg-fiery-red/80 hover:bg-fiery-red text-white font-bebas text-xl rounded-xl transition-all shadow-glow-red flex items-center gap-2"
            >
              <XCircle size={22} />
              <span>Exit Projector View</span>
            </button>
          </div>

          {/* Player Call Card Box Only */}
          <div className="w-full max-w-2xl glass-panel-gold rounded-3xl p-8 sm:p-12 border-2 border-primary-yellow shadow-2xl space-y-8 mt-16">
            {currentStagePlayer ? (
              <div className="space-y-8 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  {/* Photo */}
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-charcoal border-4 border-primary-yellow overflow-hidden shadow-glow-yellow flex items-center justify-center shrink-0">
                    {currentStagePlayer.photoUrl ? (
                      <img 
                        src={normalizeImageUrl(currentStagePlayer.photoUrl)} 
                        alt={currentStagePlayer.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => handleImageError(e, currentStagePlayer.photoUrl)}
                      />
                    ) : (
                      <User className="w-28 h-28 text-gray-400" />
                    )}
                  </div>

                  {/* Player Specs */}
                  <div className="space-y-3">
                    <span className="inline-block bg-fiery-red/20 text-fiery-red border border-fiery-red/40 font-bebas text-lg px-4 py-1 rounded-md">
                      {currentStagePlayer.position}
                    </span>
                    <h2 className="font-bebas text-6xl sm:text-7xl text-white tracking-wide leading-none">
                      {currentStagePlayer.name}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-gray-300 font-montserrat text-base">
                      <p>Roll: <span className="text-primary-yellow font-mono text-xl font-bold">{currentStagePlayer.roll}</span></p>
                      <p>Series: <span className="text-light-cyan font-semibold text-lg">{currentStagePlayer.series}</span></p>
                    </div>
                  </div>
                </div>

                {/* Admin Purchasing Log Form in Projector Mode */}
                {isAdmin && (
                  <form onSubmit={handleMarkSold} className="pt-6 border-t border-primary-yellow/30 space-y-4 bg-charcoal/90 p-6 rounded-2xl border border-gray-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-300 uppercase font-semibold mb-2">Purchasing Team</label>
                        <select
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-yellow focus:outline-none"
                          required
                        >
                          <option value="">-- Select Team --</option>
                          {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 uppercase font-semibold mb-2">Final Sold Price (TK)</label>
                        <input
                          type="number"
                          step="10"
                          min="50"
                          value={bidPrice}
                          onChange={(e) => setBidPrice(Number(e.target.value))}
                          className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-3 text-white font-bebas text-2xl text-primary-yellow focus:border-primary-yellow focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={handleMarkUnsold}
                        className="flex-1 py-3 bg-fiery-red/80 hover:bg-fiery-red text-white font-bebas text-xl rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={20} />
                        <span>Mark Unsold</span>
                      </button>

                      <button
                        type="submit"
                        className="flex-2 py-3 bg-gradient-to-r from-teal to-light-cyan hover:opacity-95 text-charcoal font-bebas text-xl font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={20} />
                        <span>Confirm Sold</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="py-16 text-center space-y-4">
                <Crown className="w-20 h-20 text-primary-yellow/40 mx-auto animate-bounce" />
                <h3 className="font-bebas text-5xl text-gray-300">STAGE IS EMPTY</h3>
                {isAdmin && (
                  <button
                    onClick={handleDrawNext}
                    className="mt-4 px-8 py-4 bg-primary-yellow text-charcoal font-bebas text-2xl font-bold rounded-xl shadow-glow-yellow hover:scale-105 transition-transform"
                  >
                    Call First Player
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
