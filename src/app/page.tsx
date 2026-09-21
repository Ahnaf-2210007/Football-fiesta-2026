'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { PlayerCard } from '@/components/PlayerCard';
import { BrandLogo } from '@/components/BrandLogo';
import { 
  Gavel, 
  Trophy, 
  Crown, 
  Users, 
  Shield, 
  Flame, 
  ArrowRight, 
  Award,
  Wallet
} from 'lucide-react';

export default function HomePage() {
  const { teams, players, fixtures } = useApp();

  const iconPlayers = players.filter(p => p.isIcon);
  const totalPlayersCount = players.length;
  
  // Calculate top 3 scorers
  const topScorers = [...players]
    .filter(p => (p.goalsScored || 0) > 0)
    .sort((a, b) => (b.goalsScored || 0) - (a.goalsScored || 0))
    .slice(0, 3);

  // Check live status badge
  const soldCount = players.filter(p => p.status === 'SOLD' || p.status === 'ICON').length;
  const isAuctionCompleted = soldCount >= (teams.length * 10);
  const isMatchesStarted = fixtures.some(f => f.isCompleted);

  return (
    <div className="space-y-16 pb-12">
      
      {/* Brand Book Hero Banner with Night Stadium & Floodlights Background */}
      <section className="relative min-h-[640px] flex items-center justify-center overflow-hidden px-4 py-16 hero-stadium-bg border-b border-light-cyan/20">
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          
          {/* Full Primary Brand Logo Showcase */}
          <div className="flex justify-center py-2">
            <div className="w-72 sm:w-96 md:w-[460px] drop-shadow-2xl hover:scale-105 transition-transform duration-300">
              <BrandLogo variant="full" size="xl" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-montserrat text-2xl sm:text-4xl text-light-cyan font-black tracking-tight italic drop-shadow-md">
              "The Game Begins Before Kick-Off"
            </p>
            <p className="text-gray-200 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed drop-shadow">
              Official central portal for live offline bidding, squad budgets, group stage draws, automated round-robin standings, and golden boot player awards.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
            <Link
              href="/auction"
              className="px-9 py-4 bg-gradient-to-r from-primary-yellow via-vibrant-orange to-fiery-red text-charcoal font-bebas text-2xl font-extrabold tracking-wider rounded-2xl shadow-glow-yellow hover:scale-105 transition-all flex items-center gap-3 border-2 border-primary-yellow"
            >
              <Gavel size={26} />
              <span>Enter Live Bidding Stage</span>
              <ArrowRight size={22} />
            </Link>

            <Link
              href="/tournament"
              className="px-8 py-4 bg-deep-blue/90 hover:bg-gray-800 text-white font-bebas text-2xl tracking-wider rounded-2xl border-2 border-light-cyan/60 hover:border-light-cyan shadow-glow-cyan transition-all flex items-center gap-3 backdrop-blur-md"
            >
              <Trophy size={24} className="text-primary-yellow" />
              <span>Tournament & Fixtures</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary-yellow text-center space-y-1 hover:scale-105 transition-transform">
            <Shield className="w-8 h-8 text-primary-yellow mx-auto mb-2" />
            <h4 className="font-bebas text-4xl text-white">6 TEAMS</h4>
            <p className="text-xs text-gray-400 font-semibold uppercase">Departmental Squads</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-teal text-center space-y-1 hover:scale-105 transition-transform">
            <Users className="w-8 h-8 text-teal mx-auto mb-2" />
            <h4 className="font-bebas text-4xl text-white">{totalPlayersCount}+ PLAYERS</h4>
            <p className="text-xs text-gray-400 font-semibold uppercase">Registered Pool</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-vibrant-orange text-center space-y-1 hover:scale-105 transition-transform">
            <Wallet className="w-8 h-8 text-vibrant-orange mx-auto mb-2" />
            <h4 className="font-bebas text-4xl text-white">1,500 TK</h4>
            <p className="text-xs text-gray-400 font-semibold uppercase">Purse Per Team</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-light-cyan text-center space-y-1 hover:scale-105 transition-transform">
            <Crown className="w-8 h-8 text-light-cyan mx-auto mb-2" />
            <h4 className="font-bebas text-4xl text-white">10 SQUAD SIZE</h4>
            <p className="text-xs text-gray-400 font-semibold uppercase">1 Icon + 9 Auctioned</p>
          </div>

        </div>
      </section>

      {/* Featured Icon Players Reel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="text-primary-yellow w-6 h-6 animate-pulse" />
              <h2 className="font-bebas text-4xl text-white tracking-wide">DESIGNATED ICON PLAYERS</h2>
            </div>
            <p className="text-xs text-gray-400">Pre-assigned marquee players leading the 6 departmental teams</p>
          </div>

          <Link
            href="/icons"
            className="text-xs font-bebas text-primary-yellow hover:text-white flex items-center gap-1 bg-primary-yellow/10 px-3.5 py-2 rounded-xl border border-primary-yellow/40 transition-colors"
          >
            <span>Manage Icons</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {iconPlayers.map((iconP) => (
            <PlayerCard key={iconP.id} player={iconP} showTeamBadge={true} />
          ))}
        </div>
      </section>

      {/* Participating Teams Overview Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="text-light-cyan w-6 h-6" />
              <h2 className="font-bebas text-4xl text-white tracking-wide">PARTICIPATING TEAMS</h2>
            </div>
            <p className="text-xs text-gray-400">Squad counts, managers, and official team rosters</p>
          </div>

          <Link
            href="/teams"
            className="text-xs font-bebas text-light-cyan hover:text-white flex items-center gap-1 bg-light-cyan/10 px-3.5 py-2 rounded-xl border border-light-cyan/40 transition-colors"
          >
            <span>View All Rosters</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const teamSquadCount = players.filter(p => p.teamId === team.id).length;

            return (
              <div key={team.id} className="glass-panel p-6 rounded-2xl space-y-4 hover:border-primary-yellow/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-charcoal border-2 overflow-hidden flex items-center justify-center shrink-0" style={{ borderColor: team.color }}>
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shield style={{ color: team.color }} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bebas text-2xl text-white">{team.name}</h3>
                      <p className="text-xs text-gray-400">Manager: {team.owner}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-charcoal/80 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-gray-400 uppercase font-semibold text-[10px]">Squad Roster Count</span>
                  <span className="font-bebas text-xl text-light-cyan">{teamSquadCount}/10 Players</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top Scorer Quick Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel-gold p-8 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-primary-yellow/30 pb-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-primary-yellow animate-bounce" />
              <div>
                <h2 className="font-bebas text-4xl text-primary-yellow">GOLDEN BOOT LEADERBOARD</h2>
                <p className="text-xs text-gray-300">Live top goal scorers across tournament matches</p>
              </div>
            </div>

            <Link
              href="/stats"
              className="px-4 py-2 bg-primary-yellow text-charcoal font-bebas text-lg font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Full Stats & Awards
            </Link>
          </div>

          {topScorers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topScorers.map((scorer, idx) => (
                <div key={scorer.id} className="bg-charcoal/80 border border-primary-yellow/30 p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bebas text-3xl text-primary-yellow w-8">#{idx + 1}</span>
                    <div>
                      <h4 className="font-bebas text-2xl text-white">{scorer.name}</h4>
                      <p className="text-xs text-gray-400">{scorer.teamName || 'Unassigned'} • {scorer.roll}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bebas text-3xl text-vibrant-orange">{scorer.goalsScored}</span>
                    <span className="text-[10px] block text-gray-400 uppercase font-semibold">Goals</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 font-montserrat text-sm italic">
              Tournament matches have not started yet. Goal stats will update live here as match scores are logged on `/tournament`.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
