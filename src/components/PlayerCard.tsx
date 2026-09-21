'use client';

import React from 'react';
import { Player } from '../types';
import { normalizeImageUrl, handleImageError } from '../utils/imageUtils';
import { Crown, Shield, User, Award } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onSelect?: (player: Player) => void;
  showTeamBadge?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onSelect, showTeamBadge = true }) => {
  const getStatusBadge = () => {
    switch (player.status) {
      case 'ICON':
        return (
          <span className="bg-gradient-to-r from-primary-yellow to-vibrant-orange text-charcoal font-bebas text-xs px-2.5 py-1 rounded-md font-bold shadow-glow-yellow flex items-center gap-1">
            <Crown size={12} /> ICON PLAYER
          </span>
        );
      case 'SOLD':
        return (
          <span className="bg-teal/20 text-teal border border-teal/40 font-bebas text-xs px-2.5 py-1 rounded-md font-bold">
            SOLD ({player.soldPrice} TK)
          </span>
        );
      case 'UNSOLD':
        return (
          <span className="bg-fiery-red/20 text-fiery-red border border-fiery-red/40 font-bebas text-xs px-2.5 py-1 rounded-md font-bold">
            UNSOLD
          </span>
        );
      default:
        return (
          <span className="bg-light-cyan/10 text-light-cyan border border-light-cyan/30 font-bebas text-xs px-2.5 py-1 rounded-md">
            AVAILABLE
          </span>
        );
    }
  };

  const getPositionBadgeColor = (pos: string) => {
    switch (pos) {
      case 'FORWARD': return 'bg-fiery-red/20 text-fiery-red border-fiery-red/40';
      case 'MIDFIELDER': return 'bg-vibrant-orange/20 text-vibrant-orange border-vibrant-orange/40';
      case 'DEFENDER': return 'bg-teal/20 text-teal border-teal/40';
      case 'GOALKEEPER': return 'bg-primary-yellow/20 text-primary-yellow border-primary-yellow/40';
      default: return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(player)}
      className={`glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary-yellow/50 group ${
        onSelect ? 'cursor-pointer' : ''
      } ${player.isIcon ? 'border-primary-yellow/40 shadow-glow-yellow' : ''}`}
    >
      {/* Background card accent */}
      <div className="absolute -right-8 -bottom-8 opacity-5 text-gray-400 group-hover:opacity-10 transition-opacity">
        <Shield size={120} />
      </div>

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-charcoal border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
            {player.photoUrl ? (
              <img 
                src={normalizeImageUrl(player.photoUrl)} 
                alt={player.name} 
                className="w-full h-full object-cover" 
                onError={(e) => handleImageError(e, player.photoUrl)}
              />
            ) : (
              <User size={24} className="text-gray-400" />
            )}
          </div>
          <div>
            <h4 className="font-bebas text-2xl text-white tracking-wide group-hover:text-primary-yellow transition-colors">
              {player.name}
            </h4>
            <p className="text-xs text-gray-400 font-montserrat">
              Roll: <span className="text-gray-200 font-mono">{player.roll}</span> • {player.series}
            </p>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-800/80 text-xs">
        <span className={`px-2.5 py-0.5 rounded font-bebas tracking-wide text-xs border ${getPositionBadgeColor(player.position)}`}>
          {player.position}
        </span>

        {showTeamBadge && player.teamName && (
          <div className="flex items-center gap-1 text-gray-300">
            <Shield size={13} className="text-primary-yellow" />
            <span className="font-semibold">{player.teamName}</span>
          </div>
        )}

        {player.goalsScored !== undefined && player.goalsScored > 0 && (
          <div className="flex items-center gap-1 text-vibrant-orange font-bebas text-sm">
            <Award size={14} />
            <span>{player.goalsScored} Goals</span>
          </div>
        )}
      </div>
    </div>
  );
};
