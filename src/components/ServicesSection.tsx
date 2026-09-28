import React, { useState } from 'react';
import {
  Activity,
  Scissors,
  ShoppingBag,
  Truck,
  Heart,
  Clock,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ClinicService } from '../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Activity,
  Scissors,
  ShoppingBag,
  Truck,
  Heart,
  Clock,
  ShieldCheck,
  Sparkles,
};

export const ServicesSection: React.FC = () => {
  const { services, settings } = useStore();

  const activeServices = (services || []).filter((s) => s.active && s.id !== 'all' && s.title !== 'Todos os Serviços');

  const categories = [
    {
      id: 'clinica',
      label: 'Clínica 24h',
      whatsappUrl: `https://api.whatsapp.com/send?phone=5511975158424&text=${encodeURIComponent('Olá! Sou cliente do Instagram e preciso de atendimento na Clínica Veterinária 24h.')}`,
    },
    {
      id: 'banho_tosa',
      label: 'Banho & Tosa',
      whatsappUrl: 'https://api.whatsapp.com/send?phone=5511975158424&text=Quero%20agendar%20Banho%20e%20Tosa%20sou%20cliente%20do%20instagram',
    },
    {
      id: 'petshop',
      label: 'Pet Shop',
      whatsappUrl: `https://api.whatsapp.com/send?phone=5511975158424&text=${encodeURIComponent('Olá! Sou cliente do Instagram e gostaria de informações sobre produtos e atendimento do Pet Shop.')}`,
    },
    {
      id: 'entrega',
      label: 'Entrega na Região',
      whatsappUrl: `https://api.whatsapp.com/send?phone=5511975158424&text=${encodeURIComponent('Olá! Sou cliente do Instagram e gostaria de informações sobre entrega na região.')}`,
    },
  ];

  const getServiceWhatsAppUrl = (service: ClinicService) => {
    if (service.category === 'banho_tosa' || service.title?.toLowerCase().includes('banho')) {
      return 'https://api.whatsapp.com/send?phone=5511975158424&text=Quero%20agendar%20Banho%20e%20Tosa%20sou%20cliente%20do%20instagram';
    }
    if (service.category === 'clinica' || service.title?.toLowerCase().includes('clínica') || service.title?.toLowerCase().includes('clinica')) {
      return `https://api.whatsapp.com/send?phone=5511975158424&text=${encodeURIComponent('Olá! Sou cliente do Instagram e preciso de atendimento na Clínica Veterinária 24h.')}`;
    }
    if (service.category === 'petshop' || service.title?.toLowerCase().includes('pet shop')) {
      return `https://api.whatsapp.com/send?phone=5511975158424&text=${encodeURIComponent('Olá! Sou cliente do Instagram e gostaria de informações sobre produtos e atendimento do Pet Shop.')}`;
    }
    if (service.category === 'entrega' || service.title?.toLowerCase().includes('entrega')) {
      return `https://api.whatsapp.com/send?phone=5511975158424&text=${encodeURIComponent('Olá! Sou cliente do Instagram e gostaria de informações sobre entrega na região.')}`;
    }
    return 'https://api.whatsapp.com/send?phone=5511975158424&text=Cliente%20do%20Instagram.%20Tenhos%20D%C3%BAvidas%20';
  };

  const handleWhatsAppService = (service: ClinicService) => {
    const url = getServiceWhatsAppUrl(service);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCategoryClick = (cat: typeof categories[0]) => {
    window.open(cat.whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="services-section" className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Serviços Pet's Family</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight mb-3">
            Clínica Veterinária 24h & Cuidado Completo
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Estrutura dedicada à saúde, higiene, alimentação e bem-estar do seu cão e gato.  Local de Atendimento » Grajaú e Apurá — São Paulo/SP.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-slate-700 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-[#D4AF37]/40 shadow-xs"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {activeServices.map((service) => {
            const IconComponent = (service.iconName && ICON_MAP[service.iconName]) || Heart;
            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Top Accent line */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {service.badge && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide bg-amber-50 text-amber-800 border border-amber-200/60">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {service.shortDescription}
                  </p>

                  {/* Highlights list */}
                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                      {service.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppService(service)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md hover:shadow-lg border border-[#D4AF37]/30 transition-all cursor-pointer group/btn"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
                    <span>{service.whatsappActionText || 'Falar no WhatsApp'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency & Official Contact Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-[#111622] to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-[#D4AF37]/40 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-extrabold">
                <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Plantão de Atendimento 24 Horas</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Seu pet precisa de cuidados ou você quer agendar um serviço?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Entre em contato pelos nossos canais oficiais da Pet's Family. Nossa equipe está pronta para atender com dedicação e transparência.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <a
                href="https://api.whatsapp.com/send?phone=5511975158424&text=Cliente%20do%20Instagram.%20Tenhos%20D%C3%BAvidas%20"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>WhatsApp: {settings.primaryWhatsappDisplay || '(11) 97515-8424'}</span>
              </a>

              <a
                href="tel:+551124950511"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-sm transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Fixo: {settings.primaryPhone || '(11) 2495-0511'}</span>
              </a>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings.address || 'Av. Dona Belmira Marin, 3618 - Loja 1'} — São Paulo/SP (CEP: {settings.cep || '04846-000'})</span>
            </div>
            <div className="text-amber-400/90 font-semibold">
              Região de Atendimento: {settings.serviceRegion || 'Grajaú e Apurá — São Paulo/SP'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
