import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  X,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { PetSpecies, ProductCategory, PetAge, PetSize } from '../types';

export const ProductCatalog: React.FC = () => {
  const { activeProducts, filters, setFilters, resetFilters, activeBrands, activeCategories, settings } = useStore();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Available unique brands from active products and partner brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    activeProducts.forEach((p) => {
      if (p.brand && !p.brand.toLowerCase().includes('dogmil')) brands.add(p.brand);
    });
    activeBrands.forEach((b) => {
      if (b.name && !b.name.toLowerCase().includes('dogmil')) brands.add(b.name);
    });
    return Array.from(brands).sort();
  }, [activeProducts, activeBrands]);

  // Dynamic category list from context
  const categoryFilterItems = useMemo(() => {
    const defaultCats = [
      { id: 'racoes', label: 'Rações & Alimentos' },
      { id: 'farmacia', label: 'Farmácia & Medicamentos' },
      { id: 'petiscos', label: 'Petiscos & Snacks' },
      { id: 'higiene', label: 'Higiene & Areias' },
      { id: 'brinquedos', label: 'Brinquedos' },
      { id: 'camas-casinhas', label: 'Caminhas & Casinhas' },
      { id: 'gaiolas', label: 'Gaiolas & Viveiros' },
      { id: 'aquarios-filtros', label: 'Aquários & Tratamento' },
    ];
    const customTypeCats = activeCategories
      .filter((c) => c.type === 'category')
      .map((c) => ({ id: c.targetKey, label: c.label }));

    const map = new Map<string, string>();
    defaultCats.forEach((c) => map.set(c.id, c.label));
    customTypeCats.forEach((c) => map.set(c.id, c.label));

    return [
      { id: 'all', label: 'Todas as Categorias' },
      ...Array.from(map.entries()).map(([id, label]) => ({ id, label })),
    ];
  }, [activeCategories]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesCategory = (product.subCategory || product.category).toLowerCase().includes(query);
        const matchesSpecies = product.species.toLowerCase().includes(query);

        if (!matchesName && !matchesBrand && !matchesDesc && !matchesCategory && !matchesSpecies) {
          return false;
        }
      }

      // 2. Species
      if (filters.species && filters.species !== 'all') {
        if (product.species !== filters.species) return false;
      }

      // 3. Category
      if (filters.category && filters.category !== 'all') {
        if (product.category !== filters.category) return false;
      }

      // 4. Brand
      if (filters.brand && filters.brand !== 'all') {
        if (product.brand !== filters.brand) return false;
      }

      // 5. Offers Only
      if (filters.onlyOffers) {
        if (!product.isPromo && (!product.originalPrice || product.originalPrice <= product.price)) {
          return false;
        }
      }

      // 6. In Stock Only
      if (filters.onlyInStock) {
        if (product.stock <= 0) return false;
      }

      // 7. Age
      if (filters.age && filters.age !== 'all') {
        if (product.age && product.age !== 'todas' && product.age !== filters.age) {
          return false;
        }
      }

      // 8. Size / Porte
      if (filters.size && filters.size !== 'all') {
        if (product.size && product.size !== 'todos' && product.size !== filters.size) {
          return false;
        }
      }

      // 9. Price Range
      if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && filters.maxPrice > 0 && product.price > filters.maxPrice) return false;

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'best_seller':
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) || (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'newest':
          return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        case 'discount': {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        }
        case 'relevance':
        default:
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      }
    });
  }, [activeProducts, filters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.species && filters.species !== 'all') count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.brand && filters.brand !== 'all') count++;
    if (filters.onlyOffers) count++;
    if (filters.onlyInStock) count++;
    if (filters.age && filters.age !== 'all') count++;
    if (filters.size && filters.size !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  const filterSidebarContent = (
    <div className="space-y-6 text-sm">
      {/* Active filters summary */}
      {activeFiltersCount > 0 && (
        <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-amber-700 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Limpar tudo
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 border">
                Busca: "{filters.searchQuery}"
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setFilters((p) => ({ ...p, searchQuery: '' }))}
                />
              </span>
            )}
            {filters.species !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 border">
                Pet: {filters.species}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setFilters((p) => ({ ...p, species: 'all' }))}
                />
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 border">
                Cat: {filters.category}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
                />
              </span>
            )}
            {filters.brand !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 border">
                Marca: {filters.brand}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setFilters((p) => ({ ...p, brand: 'all' }))}
                />
              </span>
            )}
            {filters.onlyOffers && (
              <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 border">
                Apenas Ofertas
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setFilters((p) => ({ ...p, onlyOffers: false }))}
                />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Species Filter */}
      <div>
        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2.5">
          Animal / Espécie
        </h4>
        <div className="space-y-1">
          {[
            { id: 'all', label: 'Todos os Animais', emoji: '🐾' },
            { id: 'caes', label: 'Cães / Cachorros', emoji: '🐶' },
            { id: 'gatos', label: 'Gatos / Felinos', emoji: '🐱' },
            { id: 'aves', label: 'Aves / Pássaros', emoji: '🐦' },
            { id: 'peixes', label: 'Peixes & Aquarismo', emoji: '🐠' },
            { id: 'outros', label: 'Pequenos Animais', emoji: '🐰' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, species: item.id as PetSpecies | 'all' }))}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filters.species === item.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </span>
              {filters.species === item.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2.5">
          Categorias
        </h4>
        <div className="space-y-1">
          {categoryFilterItems.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: cat.id as ProductCategory | 'all' }))}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filters.category === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              {filters.category === cat.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2.5">
          Marca
        </h4>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, brand: 'all' }))}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filters.brand === 'all'
                ? 'bg-amber-100 text-amber-950 font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>Todas as marcas</span>
            {filters.brand === 'all' && <Check className="w-3.5 h-3.5 text-amber-700" />}
          </button>
          {availableBrands.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, brand }))}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filters.brand === brand
                  ? 'bg-amber-100 text-amber-950 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>{brand}</span>
              {filters.brand === brand && <Check className="w-3.5 h-3.5 text-amber-700" />}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="pt-2 border-t border-slate-200 space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.onlyOffers || false}
            onChange={(e) => setFilters((p) => ({ ...p, onlyOffers: e.target.checked }))}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
          />
          <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Apenas Produtos em Oferta
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.onlyInStock || false}
            onChange={(e) => setFilters((p) => ({ ...p, onlyInStock: e.target.checked }))}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
          />
          <span className="text-xs font-medium text-slate-700">
            Apenas itens com estoque imediato
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10" id="catalog-section">
      {/* Top Header & Sort Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Catálogo {settings.storeName || "Pet's Family"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Mostrando <span className="font-bold text-slate-900">{filteredProducts.length}</span> produtos encontrados
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            id="open-mobile-filters-btn"
          >
            <Filter className="w-4 h-4 text-amber-600" />
            <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Ordenar por:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  sortBy: e.target.value as typeof filters.sortBy,
                }))
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 cursor-pointer"
              id="sort-by-select"
            >
              <option value="relevance">Mais Relevantes</option>
              <option value="best_seller">Mais Vendidos</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="discount">Maior Desconto</option>
              <option value="newest">Novidades</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm sticky top-36" id="desktop-filters-sidebar">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              Filtros
            </h3>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium"
              >
                Limpar
              </button>
            )}
          </div>
          {filterSidebarContent}
        </aside>

        {/* Product Cards Grid / Empty State */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5" id="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm" id="empty-search-state">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                Nenhum produto encontrado
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                Não encontramos itens correspondentes aos filtros selecionados. Tente remover os filtros ou buscar por outro termo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md hover:bg-black border border-[#D4AF37]/30 transition-colors cursor-pointer"
                >
                  Ver todos os produtos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end" id="mobile-filters-drawer">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-600" />
                Filtrar Produtos
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {filterSidebarContent}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-md border border-[#D4AF37]/30 cursor-pointer"
              >
                Aplicar Filtros ({filteredProducts.length} itens)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
