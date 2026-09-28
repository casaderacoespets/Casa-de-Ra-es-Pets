import React from 'react';
import brandLogo from '../assets/images/logo.png';
import { useStore } from '../context/StoreContext';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  isFooter?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  isFooter = false,
  variant = 'auto',
}) => {
  const { appearance, settings } = useStore();

  const activeLogo = isFooter
    ? (appearance.customFooterLogoUrl || appearance.customLogoUrl || brandLogo)
    : (appearance.customLogoUrl || brandLogo);

  // Responsive height and dimensions
  const iconDimensions = {
    sm: 'h-10 w-10 min-w-[2.5rem]',
    md: 'h-12 w-12 sm:h-13 sm:w-13 min-w-[3rem]',
    lg: 'h-16 w-16 sm:h-18 sm:w-18 min-w-[4rem]',
    xl: 'h-20 w-20 sm:h-24 sm:w-24 min-w-[5rem]',
  }[size];

  const titleSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg md:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  }[size];

  const isDarkTheme = isFooter || variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`} id="brand-logo-container">
      {/* Circular Emblem with Gold Ring Glow */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src={activeLogo}
          alt={settings.storeName || "Pet's Family"}
          className={`${iconDimensions} rounded-full object-cover shadow-md ring-2 ring-[#D4AF37]/50 bg-black block`}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          id="official-brand-logo-img"
        />
        <div className="absolute -inset-0.5 rounded-full border border-[#D4AF37]/30 pointer-events-none" />
      </div>

      {/* Brand Typography & Badges */}
      <div className="flex flex-col text-left justify-center">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-black tracking-tight leading-none ${titleSizes} ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
            Pet's Family
          </span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-xs tracking-wider">
            24h
          </span>
        </div>

        <span className={`text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
          {settings.slogan ? settings.slogan : 'Clínica Veterinária 24h & Pet Shop'}
        </span>

        {showTagline && (
          <span className="mt-0.5 text-[10px] font-semibold text-amber-500 italic tracking-wide" id="brand-logo-tagline">
            🐾 O melhor cuidado para o seu pet em Grajaú e Apurá!
          </span>
        )}
      </div>
    </div>
  );
};



