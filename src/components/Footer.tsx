import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  QrCode,
  CreditCard,
  Banknote,
  Sliders,
  Receipt,
  MessageCircle,
  Instagram,
  Facebook,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useStore } from '../context/StoreContext';
import { PetSpecies, ProductCategory } from '../types';

export const Footer: React.FC = () => {
  const {
    setFilters,
    setIsStoreLocationsOpen,
    setIsOrderHistoryOpen,
    setIsAdminOpen,
    settings,
    storeLocations,
  } = useStore();

  const handleCategoryClick = (species?: PetSpecies, category?: ProductCategory) => {
    setFilters((prev) => ({
      ...prev,
      species: species || 'all',
      category: category || 'all',
      onlyOffers: false,
      searchQuery: '',
    }));
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 mt-16 border-t-4 border-amber-400" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Slogan */}
          <div className="space-y-4">
            <div className="bg-slate-950/80 p-3 rounded-2xl inline-block shadow-sm border border-[#D4AF37]/30">
              <BrandLogo size="md" variant="dark" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-white">{settings.storeName || "Pet's Family"}</strong> — {settings.slogan || 'Clínica Veterinária 24h • Pet Shop • Banho & Tosa'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://api.whatsapp.com/message/LXFEPCZXUZ3GA1?autoload=1&app_absent=0"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                id="footer-whatsapp-btn"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp ({settings.primaryWhatsappDisplay || '11 97515-8424'})</span>
              </a>

              <a
                href="https://www.instagram.com/familypet1/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs shadow-md transition-all"
                id="footer-instagram-btn"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@familypet1</span>
              </a>

              <a
                href="https://linktr.ee/familypet1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs shadow-md transition-all"
                id="footer-linktree-btn"
              >
                <span>linktr.ee/familypet1</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links / Navigation */}
          <div className="space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-wider">
              Compre por Pet
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('caes')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  🐶 Rações & Produtos para Cães
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('gatos')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  🐱 Rações, Areias & Sachês para Gatos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('aves')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  🐦 Sementes & Acessórios para Aves
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('peixes')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  🐠 Aquarismo & Alimentos para Peixes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick(undefined, 'farmacia')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left text-rose-300 font-semibold"
                >
                  💊 Farmácia Pet (Simparic, Bravecto)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Address & Location */}
          <div className="space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              Endereço & Atendimento
            </h4>
            <div className="space-y-2.5 text-xs">
              {storeLocations.map((s) => (
                <div key={s.id} className="border-l-2 border-amber-400/60 pl-2.5 py-0.5 space-y-1">
                  <span className="font-bold text-white block">{s.name}</span>
                  <span className="text-slate-400 text-[11px] block">{s.address} - Grajaú, São Paulo - SP, {settings.cep || '04846-000'}</span>
                  <div className="flex flex-col gap-0.5 text-[11px]">
                    <a
                      href="tel:+551124950511"
                      className="text-slate-300 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Fixo: (11) 2495-0511</span>
                    </a>
                    <a
                      href="https://api.whatsapp.com/message/LXFEPCZXUZ3GA1?autoload=1&app_absent=0"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <MessageCircle className="w-3 h-3 shrink-0" />
                      <span>WhatsApp: (11) 97515-8424</span>
                    </a>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setIsStoreLocationsOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-bold text-xs underline mt-1 cursor-pointer block"
              >
                Ver endereço, horários e localização no mapa
              </button>
            </div>
          </div>

          {/* Column 4: Payment Methods & Utilities */}
          <div className="space-y-4">
            <h4 className="font-black text-sm text-white uppercase tracking-wider">
              Formas de Pagamento
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <QrCode className="w-4 h-4 shrink-0" />
                <span>PIX Instantâneo (5% de Desconto)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CreditCard className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Cartão na maquininha na entrega</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Banknote className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Dinheiro (com opção de troco)</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <h5 className="font-bold text-xs text-white uppercase tracking-wider">
                Acesso Rápido
              </h5>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsOrderHistoryOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Meus Pedidos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdminOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Painel Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Safety */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>{settings.copyrightText || `© ${new Date().getFullYear()} Pet's Family — Todos os direitos reservados.`}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compra 100% Segura
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-amber-400" /> Entrega em Grajaú e Apurá
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-400" /> O Cuidado que seu Pet Merece
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
