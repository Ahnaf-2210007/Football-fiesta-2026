'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Gavel, 
  Crown, 
  User, 
  CheckCircle2, 
  XCircle, 
  Shuffle, 
  Wallet, 
  Lock, 
  Info,
  DollarSign
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

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [bidPrice, setBidPrice] = useState<number>(50);
  const [biddingError, setBiddingError] = useState<string>('');

  const unsoldPlayers = players.filter(p => !p.isIcon && p.status === 'AVAILABLE');
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
              <span className="text-xs font-bebas text-primary-yellow px-3 py-1 bg-primary-yellow/10 rounded-full border border-primary-yellow/40">
                PROJECTOR STAGE VIEW
              </span>

              {isAdmin ? (
                <button
                  onClick={handleDrawNext}
                  disabled={unsoldPlayers.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-primary-yellow via-vibrant-orange to-fiery-red text-charcoal font-bebas text-xl font-bold tracking-wider rounded-xl shadow-glow-yellow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Shuffle size={20} />
                  <span>Call Next Random Player</span>
                </button>
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
                      <img src={currentStagePlayer.photoUrl} alt={currentStagePlayer.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-24 h-24 text-gray-400" />
                    )}
                    <span className="absolute bottom-2 left-2 bg-charcoal/90 text-light-cyan font-bebas text-xs px-2 py-0.5 rounded border border-light-cyan/40">
                      RATING: {currentStagePlayer.rating || 85}
                    </span>
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
                            const teamSpent = players.filter(p => p.teamId === t.id).reduce((sum, p) => sum + (p.soldPrice || 0), 0);
                            const remaining = t.startingPurse - teamSpent;
                            return (
                              <option key={t.id} value={t.id}>
                                {t.name} (Remaining: {remaining} TK)
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
                  Click <strong className="text-primary-yellow">"Call Next Random Player"</strong> to draw an unsold player from the regular pool onto the stage.
                </p>

                {isAdmin && (
                  <button
                    onClick={handleDrawNext}
                    className="mt-4 px-8 py-4 bg-primary-yellow text-charcoal font-bebas text-2xl font-bold rounded-xl shadow-glow-yellow hover:scale-105 transition-transform"
                  >
                    Draw First Player
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
              <p>Base price: <strong className="text-primary-yellow">50 TK</strong> | Increments: <strong className="text-white">+10 TK</strong> (&lt;100 TK), <strong className="text-white">+20 TK</strong> (100–200 TK), <strong className="text-white">+50 TK</strong> (&gt;200 TK).</p>
            </div>
          </div>
        </div>

        {/* Live Team Purses & Roster Tracker (1 col) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Wallet className="text-primary-yellow w-6 h-6" />
              <h3 className="font-bebas text-3xl text-white">LIVE TEAM PURSES</h3>
            </div>

            <div className="space-y-3">
              {teams.map((team) => {
                const teamPlayers = players.filter(p => p.teamId === team.id);
                const spent = teamPlayers.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
                const remaining = team.startingPurse - spent;

                return (
                  <div key={team.id} className="p-4 bg-charcoal/80 rounded-xl border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                        <span className="font-bebas text-xl text-white">{team.name}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-montserrat">Squad: {teamPlayers.length}/10 players</p>
                    </div>

                    <div className="text-right">
                      <span className={`font-bebas text-2xl ${remaining < 200 ? 'text-fiery-red' : 'text-primary-yellow'}`}>
                        {remaining} TK
                      </span>
                      <span className="text-[10px] block text-gray-400">Remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
