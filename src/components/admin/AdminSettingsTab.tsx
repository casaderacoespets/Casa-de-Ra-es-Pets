import React, { useState } from 'react';
import { Settings, Phone, MapPin, Instagram, Facebook, MessageCircle, Building2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminSettingsTab: React.FC = () => {
  const { settings, updateSettings, whatsappSettings, updateWhatsAppSettings, showToast } = useStore();

  const [form, setForm] = useState({
    storeName: settings.storeName || "Pet's Family",
    primaryWhatsapp: settings.primaryWhatsapp || '5511975158424',
    primaryWhatsappDisplay: settings.primaryWhatsappDisplay || '(11) 97515-8424',
    primaryPhone: settings.primaryPhone || '(11) 2495-0511',
    instagram: settings.instagram || 'familypet1',
    facebook: settings.facebook || '',
    cnpj: settings.cnpj || '',
    aboutText:
      settings.aboutText ||
      "A Pet's Family é clínica veterinária 24 horas, banho & tosa e pet shop com atendimento na região de Grajaú e Apurá (SP). Oferecemos atendimento de excelência, nutrição super premium e entrega rápida para o seu pet.",
    copyrightText:
      settings.copyrightText || "© 2026 Pet's Family — Clínica Veterinária 24h & Pet Shop. Todos os direitos reservados.",
    defaultContactMessage:
      whatsappSettings.defaultContactMessage ||
      'Cliente do Instagram. Tenhos Dúvidas ',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWhatsapp = form.primaryWhatsapp.replace(/\D/g, '');
    const finalWhatsapp = cleanWhatsapp && !cleanWhatsapp.includes('94624') ? cleanWhatsapp : '5511975158424';

    updateSettings({
      storeName: form.storeName,
      primaryWhatsapp: finalWhatsapp,
      primaryWhatsappDisplay: form.primaryWhatsappDisplay,
      primaryPhone: form.primaryPhone,
      instagram: form.instagram,
      facebook: form.facebook,
      cnpj: form.cnpj,
      aboutText: form.aboutText,
      copyrightText: form.copyrightText,
    });
    updateWhatsAppSettings({
      primaryNumber: finalWhatsapp,
      defaultContactMessage: form.defaultContactMessage,
    });
    showToast('Configurações salvas com sucesso!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-500/10 text-slate-700 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Dados da Loja, Contatos & WhatsApp</h3>
            <p className="text-xs text-slate-500">
              Configure os números de atendimento, links sociais e textos do rodapé.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0B2B6D]" />
            <span>Informações Gerais & Identificação</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome Fantasia da Loja</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ</label>
              <input
                type="text"
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Telefone */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>WhatsApp & Canais de Atendimento</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Principal para Pedidos (Com DDD e código país)
              </label>
              <input
                type="text"
                required
                value={form.primaryWhatsapp}
                onChange={(e) => setForm({ ...form, primaryWhatsapp: e.target.value })}
                placeholder="Ex: 5511975158424"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
              <span className="text-[11px] text-slate-400">
                Apenas números com DDD (Ex: 5511975158424).
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Texto de Exibição do Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={form.primaryWhatsappDisplay}
                onChange={(e) => setForm({ ...form, primaryWhatsappDisplay: e.target.value })}
                placeholder="Ex: (11) 97515-8424"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mensagem Padrão do Botão Flutuante do WhatsApp
              </label>
              <input
                type="text"
                value={form.defaultContactMessage}
                onChange={(e) => setForm({ ...form, defaultContactMessage: e.target.value })}
                placeholder="Mensagem inicial quando o cliente clica no botão verde..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Instagram className="w-4 h-4 text-rose-500" />
            <span>Redes Sociais</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Usuário Instagram (@)</label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="familypet1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Página Facebook (opcional)</label>
              <input
                type="text"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="Opcional"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
            </div>
          </div>
        </div>

        {/* Rodapé e Textos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Textos Institucionais & Rodapé</span>
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sobre a Loja</label>
              <textarea
                rows={2}
                value={form.aboutText}
                onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Linha de Copyright</label>
              <input
                type="text"
                value={form.copyrightText}
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};
