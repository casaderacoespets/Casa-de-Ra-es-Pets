import React, { useState } from 'react';
import { Palette, Image as ImageIcon, Sparkles, Check, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import brandLogo from '../../assets/images/logo.png';
import { compressImage } from '../../utils/imageCompressor';

export const AdminIdentityTab: React.FC = () => {
  const { appearance, updateAppearance, settings, updateSettings, showToast } = useStore();

  const [form, setForm] = useState({
    customLogoUrl: appearance.customLogoUrl || '',
    customFooterLogoUrl: appearance.customFooterLogoUrl || '',
    primaryColor: appearance.primaryColor || '#0B2B6D',
    secondaryColor: appearance.secondaryColor || '#F59E0B',
    slogan: settings.slogan || 'Nutrição de qualidade, amor que alimenta! 💛',
    announcementText: settings.announcementText || 'Temos Entrega Rápida • Nutrição de qualidade, amor que alimenta! 💛',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let logo = form.customLogoUrl.trim();
    if (logo.startsWith('data:image/') || logo.length > 50000) {
      logo = await compressImage(logo, { maxWidth: 600, maxHeight: 300, quality: 0.88 });
    }

    let footerLogo = form.customFooterLogoUrl.trim();
    if (footerLogo.startsWith('data:image/') || footerLogo.length > 50000) {
      footerLogo = await compressImage(footerLogo, { maxWidth: 600, maxHeight: 300, quality: 0.88 });
    }

    updateAppearance({
      customLogoUrl: logo || undefined,
      customFooterLogoUrl: footerLogo || undefined,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
    });
    updateSettings({
      slogan: form.slogan,
      announcementText: form.announcementText,
    });
    showToast('Identidade visual atualizada com sucesso!', 'success');
  };

  const handleResetLogo = () => {
    setForm((prev) => ({ ...prev, customLogoUrl: '', customFooterLogoUrl: '' }));
    updateAppearance({ customLogoUrl: undefined, customFooterLogoUrl: undefined });
    showToast('Logotipo restaurado para a imagem oficial!', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Identidade Visual & Logos</h3>
            <p className="text-xs text-slate-500">
              Personalize logotipos, slogans, barra de avisos e cores de destaque.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>Logotipo Oficial da Loja</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Logo Principal (URL ou Arquivo)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.customLogoUrl}
                    onChange={(e) => setForm({ ...form, customLogoUrl: e.target.value })}
                    placeholder="URL (https://...) ou envie um arquivo"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer flex items-center shrink-0">
                    <span>Enviar Arquivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file, { maxWidth: 600, maxHeight: 300, quality: 0.88 });
                            if (compressed) {
                              setForm((prev) => ({ ...prev, customLogoUrl: compressed }));
                            }
                          } catch (err) {
                            console.error('Erro ao comprimir logo:', err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">
                  A imagem será exibida com fidelidade total e proporções preservadas.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL da Logo do Rodapé (Opcional)
                </label>
                <input
                  type="text"
                  value={form.customFooterLogoUrl}
                  onChange={(e) => setForm({ ...form, customFooterLogoUrl: e.target.value })}
                  placeholder="Deixe em branco para usar a mesma logo do topo"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <button
                type="button"
                onClick={handleResetLogo}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restaurar Logo Padrão Oficial</span>
              </button>
            </div>

            {/* Logo Preview */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Pré-visualização do Logo
              </span>
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center max-w-full">
                <img
                  src={form.customLogoUrl || brandLogo}
                  alt="Logo Preview"
                  referrerPolicy="no-referrer"
                  className="h-14 w-auto object-contain max-w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Textos & Slogan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Slogans & Avisos do Topo</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Slogan Principal</label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                placeholder="Ex: Nutrição de qualidade, amor que alimenta! 💛"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Texto da Faixa Superior (Announcement Bar)
              </label>
              <input
                type="text"
                value={form.announcementText}
                onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
                placeholder="Ex: Temos Entrega Rápida • Nutrição de qualidade..."
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
            Salvar Identidade Visual
          </button>
        </div>
      </form>
    </div>
  );
};
