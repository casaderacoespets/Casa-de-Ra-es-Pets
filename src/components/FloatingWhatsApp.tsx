import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();

  const handleClick = () => {
    window.open('https://api.whatsapp.com/message/LXFEPCZXUZ3GA1?autoload=1&app_absent=0', '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:shadow-emerald-500/40 transition-all flex items-center gap-2.5 group cursor-pointer"
      id="floating-whatsapp-btn"
      aria-label="Fale conosco no WhatsApp"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-emerald-500 animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-emerald-500" />
      </div>
      <span className="hidden sm:inline font-black text-xs pr-1">
        Falar no WhatsApp
      </span>
    </button>
  );
};
