'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Heart, Shield, Trophy } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#101820] border-t border-white/10 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 mt-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <BrandLogo variant="horizontal" showTagline={true} />
            <p className="text-xs text-light-cyan font-montserrat uppercase tracking-[0.2em]">Department of Electrical & Computer Engineering</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-montserrat text-gray-300">
            <Link href="/auction" className="hover:text-primary-yellow transition-colors">Live Auction</Link>
            <Link href="/icons" className="hover:text-primary-yellow transition-colors">Icon Players</Link>
            <Link href="/players" className="hover:text-primary-yellow transition-colors">Player Directory</Link>
            <Link href="/teams" className="hover:text-primary-yellow transition-colors">Teams</Link>
            <Link href="/tournament" className="hover:text-primary-yellow transition-colors">Tournament</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 ECE Football Fiesta. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart size={13} className="text-fiery-red fill-fiery-red" /> for ECE Department
          </p>
        </div>
      </div>
    </footer>
  );
};
