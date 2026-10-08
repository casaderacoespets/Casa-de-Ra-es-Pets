import React, { useMemo } from 'react';
import { ArrowRight, Award, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const CARD_THEMES = [
  {
    bgColor: 'from-amber-900/90 via-slate-900 to-slate-950',
    borderColor: 'border-amber-500/30',
    accentColor: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
  },
  {
    bgColor: 'from-orange-950/90 via-slate-900 to-slate-950',
    borderColor: 'border-orange-500/30',
    accentColor: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
  },
  {
    bgColor: 'from-emerald-950/90 via-slate-900 to-slate-950',
    borderColor: 'border-emerald-500/30',
    accentColor: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
  },
];

export const FeaturedBrandsSection: React.FC = () => {
  const { brands, setFilters } = useStore();

  const featuredBrands = useMemo(() => {
    const seen = new Set<string>();
    return (brands || [])
      .filter((b) => b.active !== false && b.featured === true)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .filter((b) => {
        const key = (b.name || '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ');
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [brands]);

  const handleSelectBrand = (brandName: string) => {
    setFilters((prev) => ({
      ...prev,
      brand: brandName,
      species: 'all',
      category: 'all',
      onlyOffers: false,
      searchQuery: '',
    }));

    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (featuredBrands.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10" id="featured-brands-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-black uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Marcas em Destaque</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {featuredBrands.map((b) => b.name).join(' | ')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Linhas e marcas disponíveis no catálogo da Pet's Family.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFilters((prev) => ({ ...prev, brand: 'all', searchQuery: '' }));
            document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>Ver todas no catálogo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Featured Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {featuredBrands.map((item, idx) => {
          const theme = CARD_THEMES[idx % CARD_THEMES.length];
          return (
            <div
              key={item.id}
              className={`relative rounded-3xl p-6 sm:p-7 overflow-hidden bg-gradient-to-br ${theme.bgColor} border ${theme.borderColor} shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[220px] sm:min-h-[240px] text-white`}
            >
              {/* Background Image if available */}
              {item.logoUrl && (
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none overflow-hidden">
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}

              {/* Ambient Lighting */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top Badge & Title */}
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[11px] font-bold text-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Destaque no Catálogo</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Linhas e marcas disponíveis no catálogo da Pet's Family.
                </p>
              </div>

              {/* CTA Button */}
              <div className="relative z-10 pt-6">
                <button
                  type="button"
                  onClick={() => handleSelectBrand(item.name)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${theme.accentColor}`}
                >
                  <span>Ver Produtos {item.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
