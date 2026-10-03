import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Heart, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import petsFamilyHeroBanner from '../assets/images/pets_family_hero_1789737334138.jpg';
import { resolveBannerImage } from '../utils/bannerResolver';
import { INITIAL_BANNERS } from '../data/initialSiteData';

export const HeroBanner: React.FC = () => {
  const { setFilters, settings, activeBanners, appearance } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Ensure we always have at least 2 valid official banners for continuous carousel rotation
  const slides = useMemo(() => {
    if (activeBanners && activeBanners.length >= 2) {
      return activeBanners;
    }
    if (activeBanners && activeBanners.length === 1) {
      const missingCanonicals = INITIAL_BANNERS.filter((b) => b.id !== activeBanners[0].id);
      return [activeBanners[0], ...missingCanonicals];
    }
    return INITIAL_BANNERS;
  }, [activeBanners]);

  const bannerInterval = Math.max(3000, (appearance.bannerIntervalSeconds || 6.5) * 1000);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, bannerInterval);
    return () => clearTimeout(timer);
  }, [currentSlide, slides.length, bannerInterval]);

  // Prevent out-of-bounds index when slides change
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const slide = slides[currentSlide] || slides[0];

  const handleAction = (type?: string, target?: string) => {
    if (!type || type === 'catalog') {
      setFilters((prev) => ({ ...prev, species: 'all', category: 'all', onlyOffers: false, searchQuery: '' }));
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'whatsapp') {
      window.open(
        'https://api.whatsapp.com/send?phone=5511975158424&text=Cliente%20do%20Instagram.%20Tenhos%20D%C3%BAvidas%20',
        '_blank',
        'noopener,noreferrer'
      );
    } else if (type === 'brand') {
      setFilters((prev) => ({ ...prev, brand: target || 'all', searchQuery: '', species: 'all', category: 'all' }));
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'category') {
      setFilters((prev) => ({ ...prev, category: (target as any) || 'all', species: 'all', searchQuery: '' }));
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-auto max-w-7xl my-4 sm:my-6 shadow-2xl" id="hero-banner-section">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex items-center bg-gradient-to-r ${slide.bgGradient || 'from-[#0B2B6D] via-[#0D388A] to-[#124DB5]'} p-6 sm:p-10 md:p-14 overflow-hidden`}
        >
          {/* Background Ambient Glow & Patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
          
          {/* Right Image Container */}
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-30 lg:opacity-85 pointer-events-none overflow-hidden flex items-center justify-end">
            <img
              src={resolveBannerImage(slide.image, slide.id)}
              alt={slide.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== petsFamilyHeroBanner) {
                  target.src = petsFamilyHeroBanner;
                }
              }}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8E08A] via-[#F8E08A]/25 to-transparent lg:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden block" />
          </div>

          {/* Left Text Content */}
          <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-6">
            {/* Pill Badge */}
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-amber-300 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{slide.badge}</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              {slide.title}
            </h1>

            {/* Slogan / Highlight */}
            {slide.highlightText && (
              <p className="text-base sm:text-lg text-slate-200 font-medium max-w-xl leading-relaxed">
                {slide.highlightText}
              </p>
            )}

            {/* CTAs */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap pt-2">
              {slide.ctaText && (
                <button
                  type="button"
                  onClick={() => handleAction(slide.ctaActionType, slide.ctaTarget)}
                  className="px-6 sm:px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-lg hover:shadow-amber-400/30 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                  id="hero-primary-cta"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {slide.secondaryCta && (
                <button
                  type="button"
                  onClick={() => handleAction(slide.secondaryActionType, slide.secondaryTarget)}
                  className="px-5 sm:px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                  id="hero-secondary-cta"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{slide.secondaryCta}</span>
                </button>
              )}
            </div>

            {/* Micro Highlights Badges */}
            <div className="flex items-center gap-4 sm:gap-6 pt-3 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                Entrega rápida no seu bairro
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Produtos 100% Originais
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                Amor que alimenta
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

