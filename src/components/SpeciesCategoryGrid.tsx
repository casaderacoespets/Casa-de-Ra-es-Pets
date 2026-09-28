import React from 'react';
import { useStore } from '../context/StoreContext';
import { PetSpecies, ProductCategory, CustomCategory } from '../types';

export const SpeciesCategoryGrid: React.FC = () => {
  const { setFilters, filters, activeCategories } = useStore();

  const handleSelect = (cat: CustomCategory) => {
    if (cat.type === 'species') {
      setFilters((prev) => ({
        ...prev,
        species: cat.targetKey as PetSpecies,
        category: 'all',
        onlyOffers: false,
        searchQuery: '',
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        category: cat.targetKey as ProductCategory,
        species: 'all',
        onlyOffers: false,
        searchQuery: '',
      }));
    }

    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!activeCategories || activeCategories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-8" id="species-category-section">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Compre por Categoria
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Encontre exatamente o que seu pet precisa com facilidade
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {activeCategories.map((cat) => {
          const isSelected =
            (cat.type === 'species' && filters.species === cat.targetKey && filters.category === 'all') ||
            (cat.type === 'category' && filters.category === cat.targetKey && filters.species === 'all');

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat)}
              className={`group flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border transition-all text-center cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-amber-500 shadow-md scale-105 ' + (cat.bgColor || 'bg-amber-50 border-amber-200 text-amber-950')
                  : 'hover:shadow-md hover:-translate-y-0.5 ' + (cat.bgColor || 'bg-amber-50 border-amber-200 text-amber-950')
              }`}
              id={`cat-card-${cat.id}`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110 shadow-sm ${cat.iconBg || 'bg-amber-400/20 text-amber-700'}`}
              >
                <span>{cat.emoji || '🐾'}</span>
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                {cat.label}
              </span>
              <span className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                {cat.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
