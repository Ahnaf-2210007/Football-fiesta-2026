'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { AdminModal } from './AdminModal';
import { BrandLogo } from './BrandLogo';
import { 
  Trophy, 
  Gavel, 
  Crown, 
  Users, 
  ShieldAlert, 
  Calendar, 
  BarChart3, 
  BookOpen, 
  Lock, 
  Unlock,
  Menu,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { isAdmin } = useApp();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Trophy },
    { href: '/auction', label: 'Live Auction', icon: Gavel, highlight: true },
    { href: '/icons', label: 'Icon Players', icon: Crown },
    { href: '/players', label: 'Player Directory', icon: Users },
    { href: '/teams', label: 'Teams & Squads', icon: ShieldAlert },
    { href: '/tournament', label: 'Tournament & Groups', icon: Calendar },
    { href: '/stats', label: 'Stats & Awards', icon: BarChart3 },
    { href: '/rules', label: 'Rulebook', icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#141d29]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">

            {/* Logo & Brand Title */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <BrandLogo variant="horizontal" size="sm" showTagline={true} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-montserrat font-semibold transition-all ${
                      isActive
                        ? 'bg-primary-yellow text-charcoal shadow-glow-yellow font-bold'
                        : link.highlight
                        ? 'bg-vibrant-orange/20 text-vibrant-orange hover:bg-vibrant-orange hover:text-white border border-vibrant-orange/40'
                        : 'text-gray-300 hover:text-white hover:bg-deep-blue/60'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Admin Toggle & Mobile Menu Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bebas tracking-wide transition-all shadow-[0_0_18px_rgba(78,228,255,0.2)] ${
                  isAdmin
                    ? 'bg-teal/20 text-teal border border-teal/50 hover:bg-teal/30 shadow-glow-cyan'
                    : 'bg-[#1e2f38] hover:bg-[#21455a] text-white border border-[#4EE4FF]/40'
                }`}
              >
                {isAdmin ? (
                  <>
                    <Unlock size={16} className="text-teal animate-pulse" />
                    <span className="hidden sm:inline">ADMIN MODE ACTIVE</span>
                    <span className="sm:hidden">ADMIN</span>
                  </>
                ) : (
                  <>
                    <Lock size={17} className="text-primary-yellow" />
                    <span>Admin Login</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-white hover:text-primary-yellow bg-[#1e2f38] rounded-xl border border-white/10 shadow-md"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-deep-blue/95 border-b border-light-cyan/20 px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-montserrat font-semibold ${
                    isActive
                      ? 'bg-primary-yellow text-charcoal font-bold'
                      : 'text-gray-200 hover:bg-charcoal/60'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Admin Auth Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
};
