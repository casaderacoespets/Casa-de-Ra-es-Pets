import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Clock, Phone, MessageCircle, Navigation, Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const StoreLocationsModal: React.FC = () => {
  const { storeLocations, isStoreLocationsOpen, setIsStoreLocationsOpen, settings, whatsappSettings } = useStore();

  if (!isStoreLocationsOpen) return null;

  const activeStores = storeLocations.filter((s) => s.isActive !== false);
  const OFFICIAL_WHATSAPP_URL = 'https://api.whatsapp.com/message/LXFEPCZXUZ3GA1?autoload=1&app_absent=0';
  const rawWhatsappDigits = (settings.primaryWhatsapp || whatsappSettings?.primaryNumber || '5511975158424').replace(/\D/g, '');
  const whatsappDigits = rawWhatsappDigits.startsWith('55') ? rawWhatsappDigits : `55${rawWhatsappDigits || '11975158424'}`;
  const defaultMsg = whatsappSettings?.defaultContactMessage || 'Cliente do Instagram. Tenhos Dúvidas ';
  const isDefaultOfficialWhatsapp =
    (whatsappDigits === '5511975158424' || rawWhatsappDigits === '11975158424') &&
    defaultMsg.trim() === 'Cliente do Instagram. Tenhos Dúvidas';
  const modalWhatsappHref = isDefaultOfficialWhatsapp
    ? OFFICIAL_WHATSAPP_URL
    : `https://api.whatsapp.com/send?phone=${whatsappDigits}&text=${encodeURIComponent(defaultMsg)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" id="store-locations-modal-container">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setIsStoreLocationsOpen(false)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          id="store-locations-modal"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-[#0B2B6D] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white leading-tight">
                  Endereço & Atendimento
                </h3>
                <p className="text-xs text-slate-200">
                  Venha nos visitar na Av. Dona Belmira Marin ou retire seu pedido
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsStoreLocationsOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {activeStores.map((store) => (
              <div
                key={store.id}
                className="bg-slate-50 hover:bg-amber-50/40 p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                      Sede Oficial Pet's Family
                    </span>
                    <h4 className="font-black text-base text-slate-900 leading-tight">
                      {store.name}
                    </h4>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Aberta Hoje
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">{settings.address || store.address}</span>
                      <span className="block text-slate-500">
                        {store.neighborhood || 'Grajaú'} — {store.city || settings.city || 'São Paulo - SP'} (CEP: {settings.cep || '04846-000'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{store.hours}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <a
                      href={`tel:+55${((settings.primaryPhone || store.phone || '(11) 2495-0511').replace(/\D/g, '') || '1124950511').replace(/^55/, '')}`}
                      className="hover:text-[#0B2B6D] transition-colors"
                    >
                      {settings.primaryPhone || store.phone}
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <a
                    href={modalWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar no WhatsApp</span>
                  </a>

                  <a
                    href={store.mapUrl || store.mapsUrl || 'https://www.google.com/maps/place/Clinica+Veterin%C3%A1ria+Pets+Family/@-23.7535282,-46.6812851,17z/data=!3m1!4b1!4m6!3m5!1s0x94ce4f4d12c10fc5:0x66db650c2b64a291!8m2!3d-23.7535282!4d-46.6812851!16s%2Fg%2F11f3s5jtfc?entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D'}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-4 h-4 text-[#0B2B6D]" />
                    <span>Ver no Mapa</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Precisa de entrega rápida na sua casa? Selecione seus produtos e compre pelo site com entrega no mesmo dia.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
