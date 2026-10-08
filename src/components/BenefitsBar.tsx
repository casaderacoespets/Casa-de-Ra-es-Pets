import React from 'react';
import {
  Truck,
  MessageCircle,
  Store,
  ShieldCheck,
  Heart,
  Clock,
  Sparkles,
  Award,
  Tag,
  CreditCard,
  Activity,
  Scissors,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SiteBenefit } from '../types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  MessageCircle,
  Store,
  ShieldCheck,
  Heart,
  Clock,
  Sparkles,
  Award,
  Tag,
  CreditCard,
  Activity,
  Scissors,
};

export const BenefitsBar: React.FC = () => {
  const { setIsStoreLocationsOpen, settings, whatsappSettings, activeBenefits } = useStore();

  const rawWhatsappDigits = (settings.primaryWhatsapp || whatsappSettings?.primaryNumber || '5511975158424').replace(/\D/g, '');
  const whatsappDigits = rawWhatsappDigits.startsWith('55') ? rawWhatsappDigits : `55${rawWhatsappDigits || '11975158424'}`;
  const defaultMsg = whatsappSettings?.defaultContactMessage || 'Cliente do Instagram. Tenhos Dúvidas ';

  const getAction = (benefit: SiteBenefit) => {
    if (benefit.actionType === 'whatsapp') {
      if (benefit.id === 'ben-1' || benefit.title.toLowerCase().includes('clínica') || benefit.title.toLowerCase().includes('clinica')) {
        return () => window.open(`https://api.whatsapp.com/send?phone=${whatsappDigits}&text=${encodeURIComponent('Olá! Sou cliente do Instagram e preciso de atendimento na Clínica Veterinária 24h.')}`, '_blank');
      }
      if (benefit.id === 'ben-2' || benefit.title.toLowerCase().includes('banho')) {
        return () => window.open(`https://api.whatsapp.com/send?phone=${whatsappDigits}&text=${encodeURIComponent('Quero agendar Banho e Tosa sou cliente do instagram')}`, '_blank');
      }
      return () => window.open(`https://api.whatsapp.com/send?phone=${whatsappDigits}&text=${encodeURIComponent(defaultMsg)}`, '_blank');
    }
    if (benefit.actionType === 'stores') {
      return () => setIsStoreLocationsOpen(true);
    }
    if (benefit.actionType === 'catalog') {
      return () => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    return undefined;
  };

  if (!activeBenefits || activeBenefits.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-8" id="benefits-section">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        {activeBenefits.map((b) => {
          const Icon = ICON_MAP[b.iconName] || Truck;
          const action = getAction(b);
          return (
            <div
              key={b.id}
              onClick={action}
              className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all ${
                action ? 'cursor-pointer hover:bg-slate-50' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${b.iconColor || 'text-amber-500 bg-amber-50'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 leading-tight flex items-center gap-1">
                  {b.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {b.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

