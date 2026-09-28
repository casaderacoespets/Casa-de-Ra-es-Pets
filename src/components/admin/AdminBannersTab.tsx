import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Check,
  X,
  Sliders,
  Clock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BannerSlide } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { resolveBannerImage } from '../../utils/bannerResolver';

export const AdminBannersTab: React.FC = () => {
  const {
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    appearance,
    updateAppearance,
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<BannerSlide> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleStartCreate = () => {
    setEditingBanner({
      title: '',
      highlightText: '',
      badge: 'Destaque Especial',
      ctaText: 'Ver Produtos',
      ctaActionType: 'catalog',
      ctaTarget: 'all',
      secondaryCta: 'Falar no WhatsApp',
      secondaryActionType: 'whatsapp',
      image: '',
      bgGradient: 'from-[#0B2B6D] via-[#0D388A] to-[#124DB5]',
      order: banners.length + 1,
      active: true,
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (b: BannerSlide) => {
    setEditingBanner({ ...b });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleMoveOrder = (banner: BannerSlide, direction: 'up' | 'down') => {
    const sorted = [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sorted.findIndex((b) => b.id === banner.id);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex > 0) {
      const prev = sorted[currentIndex - 1];
      const tempOrder = prev.order || currentIndex;
      updateBanner({ ...prev, order: banner.order || currentIndex + 1 });
      updateBanner({ ...banner, order: tempOrder });
    } else if (direction === 'down' && currentIndex < sorted.length - 1) {
      const next = sorted[currentIndex + 1];
      const tempOrder = next.order || currentIndex + 2;
      updateBanner({ ...next, order: banner.order || currentIndex + 1 });
      updateBanner({ ...banner, order: tempOrder });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title) return;

    let finalImage = editingBanner.image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80';
    if (finalImage.startsWith('data:image/') || finalImage.length > 50000) {
      finalImage = await compressImage(finalImage, { maxWidth: 1200, maxHeight: 800, quality: 0.82 });
    }

    if (isNew) {
      addBanner({
        title: editingBanner.title,
        highlightText: editingBanner.highlightText || '',
        badge: editingBanner.badge || 'Destaque',
        ctaText: editingBanner.ctaText || 'Comprar agora',
        ctaActionType: editingBanner.ctaActionType || 'catalog',
        ctaTarget: editingBanner.ctaTarget || 'all',
        secondaryCta: editingBanner.secondaryCta,
        secondaryActionType: editingBanner.secondaryActionType || 'whatsapp',
        image: finalImage,
        bgGradient: editingBanner.bgGradient || 'from-[#0B2B6D] via-[#0D388A] to-[#124DB5]',
        order: editingBanner.order || banners.length + 1,
        active: editingBanner.active ?? true,
      });
    } else if (editingBanner.id) {
      updateBanner({
        ...editingBanner,
        id: editingBanner.id,
        title: editingBanner.title,
        image: finalImage,
      } as BannerSlide);
    }

    setIsEditing(false);
    setEditingBanner(null);
  };

  const sortedBanners = [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Banners Promocionais & Hero</h3>
            <p className="text-xs text-slate-500">
              Gerencie os slides em destaque na página principal, textos, botões e imagens.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4 text-slate-400" />
            <label className="text-xs text-slate-600 font-medium">Tempo do Slide:</label>
            <select
              value={appearance.bannerIntervalSeconds || 6.5}
              onChange={(e) => updateAppearance({ bannerIntervalSeconds: parseFloat(e.target.value) })}
              className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="4">4 seg</option>
              <option value="5.5">5.5 seg</option>
              <option value="6.5">6.5 seg</option>
              <option value="8">8 seg</option>
              <option value="10">10 seg</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleStartCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Banner</span>
          </button>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {sortedBanners.map((b, idx) => (
          <div
            key={b.id}
            className={`bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              b.active === false ? 'opacity-50 bg-slate-50/50' : ''
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={resolveBannerImage(b.image, b.id)}
                alt={b.title}
                referrerPolicy="no-referrer"
                className="w-24 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {b.badge || 'Destaque'}
                  </span>
                  <span className="text-[11px] text-slate-400">Posição: #{b.order || idx + 1}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate">{b.title}</h4>
                <p className="text-xs text-slate-500 truncate max-w-md">{b.highlightText}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              {/* Order buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveOrder(b, 'up')}
                  className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  title="Mover para Cima"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === sortedBanners.length - 1}
                  onClick={() => handleMoveOrder(b, 'down')}
                  className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  title="Mover para Baixo"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggle Active */}
              <button
                type="button"
                onClick={() => toggleBannerActive(b.id)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                  b.active !== false
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {b.active !== false ? 'Ativo' : 'Inativo'}
              </button>

              <button
                type="button"
                onClick={() => handleStartEdit(b)}
                className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                title="Editar Banner"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Deseja remover o banner "${b.title}"?`)) {
                    deleteBanner(b.id);
                  }
                }}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Excluir Banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {isEditing && editingBanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {isNew ? 'Novo Banner Promocional' : 'Editar Banner'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título Principal *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="Ex: Clínica Veterinária 24h & Rações Especiais"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Texto de Destaque / Subtítulo</label>
                <input
                  type="text"
                  value={editingBanner.highlightText || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, highlightText: e.target.value })}
                  placeholder="Ex: Linhas e marcas disponíveis no catálogo da Pet's Family."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Superior</label>
                  <input
                    type="text"
                    value={editingBanner.badge || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    placeholder="Ex: Destaque em Nutrição Especial"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Imagem do Banner (URL ou Arquivo)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingBanner.image || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                      placeholder="https://... ou envie arquivo"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                    />
                    <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer flex items-center shrink-0">
                      <span>Arquivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 800, quality: 0.82 });
                              if (compressed) {
                                setEditingBanner((prev) => (prev ? { ...prev, image: compressed } : prev));
                              }
                            } catch (err) {
                              console.error('Erro ao comprimir imagem do banner:', err);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Texto do Botão Principal</label>
                  <input
                    type="text"
                    value={editingBanner.ctaText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                    placeholder="Ex: Comprar agora"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ação do Botão Principal</label>
                  <select
                    value={editingBanner.ctaActionType || 'catalog'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaActionType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="catalog">Ir para o Catálogo</option>
                    <option value="whatsapp">Abrir WhatsApp</option>
                    <option value="brand">Filtrar Marca Específica</option>
                    <option value="category">Filtrar Categoria</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Texto do Botão Secundário</label>
                  <input
                    type="text"
                    value={editingBanner.secondaryCta || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, secondaryCta: e.target.value })}
                    placeholder="Ex: Falar no WhatsApp"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ação do Botão Secundário</label>
                  <select
                    value={editingBanner.secondaryActionType || 'whatsapp'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, secondaryActionType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="whatsapp">Abrir WhatsApp</option>
                    <option value="catalog">Ir para o Catálogo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="banner-active-check"
                  checked={editingBanner.active !== false}
                  onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                  className="rounded text-[#0B2B6D] w-4 h-4"
                />
                <label htmlFor="banner-active-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Banner Ativo na Loja
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Salvar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
