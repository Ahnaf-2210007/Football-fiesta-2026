'use client';

import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'horizontal' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  logoSrc?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  showTagline = true,
  logoSrc = '/logo.png',
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-20 h-auto';
      case 'md':
        return 'w-28 h-auto';
      case 'lg':
        return 'w-40 h-auto';
      case 'xl':
        return 'w-72 sm:w-80 md:w-[28rem] h-auto';
      default:
        return 'w-28 h-auto';
    }
  };

  const imageClass =
    variant === 'compact'
      ? 'w-12 h-auto max-h-9'
      : variant === 'horizontal'
        ? 'w-32 sm:w-36 h-auto max-h-11'
        : getSizeClass();

  return (
    <div className="flex items-center justify-center">
      <img
        src={logoSrc}
        alt="ECE Football Fiesta official logo"
        className={`object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-[1.02] ${imageClass}`}
      />
      {showTagline && variant !== 'full' && (
        <span className="sr-only">The Game Begins Before Kick-Off</span>
      )}
    </div>
  );
};
