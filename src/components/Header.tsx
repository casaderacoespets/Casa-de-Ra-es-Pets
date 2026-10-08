import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Truck,
  Heart,
  History,
  Store,
  ChevronDown,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import { PetSpecies, ProductCategory } from '../types';

export const Header: React.FC = () => {
  const {
    cartCount,
    subtotal,
    setIsCartOpen,
    setIsOrderHistoryOpen,
    setIsStoreLocationsOpen,
    filters,
    setFilters,
    setSearchQuery,
    setSpeciesFilter,
    setCategoryFilter,
    orders,
    settings,
    whatsappSettings,
    storeLocations,
  } = useStore();

  const OFFICIAL_WHATSAPP_URL = 'https://api.whatsapp.com/message/LXFEPCZXUZ3GA1?autoload=1&app_absent=0';
  const rawWhatsappDigits = (settings.primaryWhatsapp || whatsappSettings?.primaryNumber || '5511975158424').replace(/\D/g, '');
  const whatsappDigits = rawWhatsappDigits.startsWith('55') ? rawWhatsappDigits : `55${rawWhatsappDigits || '11975158424'}`;
  const defaultMsg = whatsappSettings?.defaultContactMessage || 'Cliente do Instagram. Tenhos Dúvidas ';
  const isDefaultOfficialWhatsapp =
    (whatsappDigits === '5511975158424' || rawWhatsappDigits === '11975158424') &&
    defaultMsg.trim() === 'Cliente do Instagram. Tenhos Dúvidas';
  const headerWhatsappHref = isDefaultOfficialWhatsapp
    ? OFFICIAL_WHATSAPP_URL
    : `https://api.whatsapp.com/send?phone=${whatsappDigits}&text=${encodeURIComponent(defaultMsg)}`;

  const rawPhoneDigits = (settings.primaryPhone || '(11) 2495-0511').replace(/\D/g, '') || '1124950511';
  const headerPhoneHref = rawPhoneDigits.startsWith('55') ? `tel:+${rawPhoneDigits}` : `tel:+55${rawPhoneDigits}`;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync internal search input with global filter
  useEffect(() => {
    setSearchInput(filters.searchQuery);
  }, [filters.searchQuery]);

  // Handle outside click for search suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setIsSearchFocused(false);
    // Scroll to catalog smoothly
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickSearch = (term: string) => {
    setSearchInput(term);
    setSearchQuery(term);
    setIsSearchFocused(false);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const popularSearches = [
    'Premier Formula',
    'Royal Canin',
    'Golden Formula',
    'Simparic',
    'Bravecto',
    'Whiskas Castrados',
    'GranPlus',
    'NuTrópica Calopsita',
    'Pipicat Areia',
    'Petisco Churu',
    'Tapete Higiênico',
  ];

  const departments: {
    id: string;
    label: string;
    icon: string;
    species?: PetSpecies;
    category?: ProductCategory;
    isPromo?: boolean;
    subItems?: { label: string; species?: PetSpecies; category?: ProductCategory }[];
  }[] = [
    {
      id: 'caes',
      label: 'Cães',
      icon: '🐶',
      species: 'caes',
      subItems: [
        { label: 'Todas para Cães', species: 'caes' },
        { label: 'Rações Secas', species: 'caes', category: 'racoes' },
        { label: 'Petiscos e Bifinhos', species: 'caes', category: 'petiscos' },
        { label: 'Antipulgas e Farmácia', species: 'caes', category: 'farmacia' },
        { label: 'Higiene e Tapetes', species: 'caes', category: 'higiene' },
        { label: 'Brinquedos', species: 'caes', category: 'brinquedos' },
        { label: 'Caminhas e Casinhas', species: 'caes', category: 'camas-casinhas' },
      ],
    },
    {
      id: 'gatos',
      label: 'Gatos',
      icon: '🐱',
      species: 'gatos',
      subItems: [
        { label: 'Tudo para Gatos', species: 'gatos' },
        { label: 'Rações Secas e Úmidas', species: 'gatos', category: 'racoes' },
        { label: 'Areias Higiênicas', species: 'gatos', category: 'higiene' },
        { label: 'Petiscos e Churu', species: 'gatos', category: 'petiscos' },
        { label: 'Arranhadores e Brinquedos', species: 'gatos', category: 'brinquedos' },
        { label: 'Farmácia Felina', species: 'gatos', category: 'farmacia' },
      ],
    },
    {
      id: 'aves',
      label: 'Aves',
      icon: '🐦',
      species: 'aves',
      subItems: [
        { label: 'Tudo para Aves', species: 'aves' },
        { label: 'Rações e Misturas', species: 'aves', category: 'racoes' },
        { label: 'Gaiolas e Viveiros', species: 'aves', category: 'gaiolas' },
      ],
    },
    {
      id: 'peixes',
      label: 'Peixes & Aquários',
      icon: '🐠',
      species: 'peixes',
      subItems: [
        { label: 'Tudo para Aquarismo', species: 'peixes' },
        { label: 'Rações e Flocos', species: 'peixes', category: 'racoes' },
        { label: 'Tratamento de Água', species: 'peixes', category: 'aquarios-filtros' },
      ],
    },
    {
      id: 'outros',
      label: 'Pequenos Animais',
      icon: '🐰',
      species: 'outros',
      subItems: [
        { label: 'Coelhos e Roedores', species: 'outros' },
        { label: 'Feno e Alimentos', species: 'outros', category: 'racoes' },
      ],
    },
    {
      id: 'farmacia',
      label: 'Farmácia Pet',
      icon: '💊',
      category: 'farmacia',
      subItems: [
        { label: 'Todos os Medicamentos', category: 'farmacia' },
        { label: 'Antipulgas e Carrapatos', category: 'farmacia' },
        { label: 'Vermífugos', category: 'farmacia' },
      ],
    },
    {
      id: 'ofertas',
      label: 'Ofertas do Dia',
      icon: '🔥',
      isPromo: true,
    },
  ];

  const handleSelectDepartment = (dep: typeof departments[0]) => {
    if (dep.isPromo) {
      setFilters((prev) => ({
        ...prev,
        onlyOffers: true,
        species: 'all',
        category: 'all',
        searchQuery: '',
      }));
    } else if (dep.species) {
      setFilters((prev) => ({
        ...prev,
        species: dep.species,
        category: 'all',
        onlyOffers: false,
        searchQuery: '',
      }));
    } else if (dep.category) {
      setFilters((prev) => ({
        ...prev,
        category: dep.category,
        species: 'all',
        onlyOffers: false,
        searchQuery: '',
      }));
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSubItem = (item: { species?: PetSpecies; category?: ProductCategory }) => {
    setFilters((prev) => ({
      ...prev,
      species: item.species || 'all',
      category: item.category || 'all',
      onlyOffers: false,
      searchQuery: '',
    }));
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-md border-b border-slate-100" id="main-header">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 sm:px-6 font-medium border-b border-[#D4AF37]/20" id="top-announcement-bar">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6 flex-wrap">
          {/* LADO ESQUERDO */}
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {settings.announcementText || 'Entrega rápida na região (Grajaú e Apurá) • Clínica 24 Horas'}
            </span>
          </div>

          {/* LADO DIREITO */}
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs">
            <button
              type="button"
              onClick={() => setIsStoreLocationsOpen(true)}
              className="flex items-center gap-1.5 text-slate-200 hover:text-amber-300 transition-colors cursor-pointer"
              id="top-bar-stores-btn"
            >
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>Loja Física ({storeLocations[0]?.neighborhood || 'Grajaú'})</span>
            </button>

            <div className="flex items-center gap-2 text-slate-200">
              <a
                href={headerPhoneHref}
                className="hover:text-amber-300 transition-colors font-medium flex items-center gap-1.5"
                title="Ligar para telefone fixo"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span>Fix: {settings.primaryPhone || '(11) 2495-0511'}</span>
              </a>
              <span className="text-slate-600">|</span>
              <a
                href={headerWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
                id="top-bar-whatsapp-link"
              >
                <span>Whats: {settings.primaryWhatsappDisplay || '(11) 97515-8424'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-700 hover:text-[#0B2B6D] hover:bg-slate-100 rounded-lg transition-colors"
            id="mobile-menu-trigger"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Official Store Logo */}
          <div
            className="cursor-pointer shrink-0"
            onClick={() => {
              setFilters({
                searchQuery: '',
                species: 'all',
                category: 'all',
                brand: 'all',
                minPrice: 0,
                maxPrice: 500,
                onlyOffers: false,
                onlyInStock: false,
                age: 'all',
                size: 'all',
                sortBy: 'relevance',
              });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            id="header-logo-button"
            role="button"
            tabIndex={0}
          >
            <BrandLogo size="md" />
          </div>

          {/* Large Search Bar */}
          <div className="relative flex-1 max-w-2xl hidden sm:block" ref={searchContainerRef} id="header-search-box">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="O que seu pet precisa hoje?"
                className="w-full pl-11 pr-24 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-amber-500 rounded-full text-sm text-slate-900 placeholder:text-slate-500 shadow-inner focus:shadow-md transition-all outline-none"
                id="search-input-field"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4 text-amber-600" />
              </div>
              
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                  }}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#0B2B6D] hover:bg-[#081F50] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                id="search-submit-btn"
              >
                Buscar
              </button>
            </form>

            {/* Quick Search Suggestions Dropdown */}
            {isSearchFocused && (
              <div
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                id="search-suggestions-dropdown"
              >
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mais procurados na {settings.storeName || "Pet's Family"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleQuickSearch(term)}
                      className="text-xs font-medium bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      <Search className="w-3 h-3 text-slate-400" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Store locations button */}
            <button
              type="button"
              onClick={() => setIsStoreLocationsOpen(true)}
              className="hidden lg:flex items-center gap-2 p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors text-xs font-medium cursor-pointer"
              id="header-stores-btn"
              title="Ver endereço e atendimento no Grajaú"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight hidden xl:block">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Onde</span>
                <span className="font-semibold text-slate-800">Estamos</span>
              </div>
            </button>

            {/* Order History */}
            <button
              type="button"
              onClick={() => setIsOrderHistoryOpen(true)}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors text-xs font-medium relative cursor-pointer"
              id="header-order-history-btn"
              title="Histórico de Pedidos"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/50">
                <History className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight hidden xl:block">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Histórico</span>
                <span className="font-semibold text-slate-800">Meus Pedidos</span>
              </div>
              {orders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-3 sm:px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg border border-[#D4AF37]/50 relative group cursor-pointer"
              id="header-cart-btn"
              aria-label="Abrir carrinho de compras"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-900 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse" id="cart-counter-badge">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-300 font-medium">Meu Carrinho</span>
                <span className="text-xs font-bold text-amber-300">
                  {subtotal > 0
                    ? subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'R$ 0,00'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="mt-2 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="O que seu pet precisa hoje?"
              className="w-full pl-9 pr-16 py-2 bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#0B2B6D] rounded-full text-xs text-slate-900 placeholder:text-slate-500 outline-none"
              id="mobile-search-input"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#0B2B6D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* 3. DEPARTMENT NAVIGATION BAR (DESKTOP) */}
      <nav className="bg-slate-50 border-t border-slate-200 hidden lg:block" id="department-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1 py-1">
            {departments.map((dep) => {
              const isSelected =
                (dep.isPromo && filters.onlyOffers) ||
                (!filters.onlyOffers && dep.species && filters.species === dep.species) ||
                (!filters.onlyOffers && dep.category && filters.category === dep.category);

              return (
                <div
                  key={dep.id}
                  className="relative group"
                  onMouseEnter={() => dep.subItems && setActiveDropdown(dep.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectDepartment(dep)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      dep.isPromo
                        ? 'bg-amber-400/20 text-amber-800 hover:bg-amber-400/30 font-bold'
                        : isSelected
                        ? 'bg-[#0B2B6D] text-white'
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    id={`nav-dep-${dep.id}`}
                  >
                    <span>{dep.icon}</span>
                    <span>{dep.label}</span>
                    {dep.subItems && <ChevronDown className="w-3 h-3 opacity-60" />}
                  </button>

                  {/* Dropdown Menu for Subcategories */}
                  {dep.subItems && activeDropdown === dep.id && (
                    <div className="absolute left-0 top-full bg-white shadow-xl rounded-xl border border-slate-100 p-2 min-w-[200px] z-50">
                      {dep.subItems.map((sub, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSubItem(sub)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 rounded-lg transition-colors font-medium"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% Satisfação Garantida
            </span>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" id="mobile-menu-overlay">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <BrandLogo size="sm" />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Departments & Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Departamentos
                </h4>
                <div className="space-y-1">
                  {departments.map((dep) => (
                    <button
                      key={dep.id}
                      type="button"
                      onClick={() => handleSelectDepartment(dep)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                        dep.isPromo
                          ? 'bg-amber-100 text-amber-900'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{dep.icon}</span>
                        <span>{dep.label}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Atendimento & Loja Física
                </h4>
                <div className="space-y-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStoreLocationsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-medium text-left"
                  >
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Conheça nossa Loja Física</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOrderHistoryOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-medium text-left"
                  >
                    <History className="w-4 h-4 text-blue-600" />
                    <span>Meus Pedidos Anteriores</span>
                  </button>

                  <a
                    href={headerWhatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp {settings.primaryWhatsappDisplay || '(11) 97515-8424'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[11px] text-slate-500">
                {settings.storeName || "Pet's Family"} • {settings.slogan || 'Clínica Veterinária 24h & Pet Shop'}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
