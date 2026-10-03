import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Award, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PartnerBrand } from '../../types';
import { compressImage } from '../../utils/imageCompressor';

export const AdminBrandsTab: React.FC = () => {
  const { brands, addBrand, updateBrand, deleteBrand, toggleBrandActive } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<PartnerBrand> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleStartCreate = () => {
    setEditingBrand({
      name: '',
      logoUrl: '',
      featured: true,
      order: brands.length + 1,
      active: true,
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (b: PartnerBrand) => {
    setEditingBrand({ ...b });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand?.name) return;

    let finalLogoUrl = editingBrand.logoUrl || '';
    if (finalLogoUrl.startsWith('data:image/') || finalLogoUrl.length > 50000) {
      finalLogoUrl = await compressImage(finalLogoUrl, { maxWidth: 500, maxHeight: 500, quality: 0.85 });
    }

    if (isNew) {
      addBrand({
        name: editingBrand.name,
        logoUrl: finalLogoUrl,
        featured: !!editingBrand.featured,
        order: editingBrand.order || brands.length + 1,
        active: editingBrand.active ?? true,
      });
    } else if (editingBrand.id) {
      updateBrand({
        ...editingBrand,
        id: editingBrand.id,
        name: editingBrand.name,
        logoUrl: finalLogoUrl,
        featured: !!editingBrand.featured,
        order: editingBrand.order || 1,
        active: editingBrand.active ?? true,
      } as PartnerBrand);
    }

    setIsEditing(false);
    setEditingBrand(null);
  };

  const sortedBrands = [...brands].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleMoveOrder = (brand: PartnerBrand, direction: 'up' | 'down') => {
    const currentIndex = sortedBrands.findIndex((b) => b.id === brand.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedBrands.length) return;

    const neighbor = sortedBrands[targetIndex];
    const currentOrder = brand.order || currentIndex + 1;
    const neighborOrder = neighbor.order || targetIndex + 1;

    const newCurrentOrder =
      currentOrder === neighborOrder ? targetIndex + 1 : neighborOrder;
    const newNeighborOrder =
      currentOrder === neighborOrder ? currentIndex + 1 : currentOrder;

    updateBrand({ ...neighbor, featured: !!neighbor.featured, order: newNeighborOrder });
    updateBrand({ ...brand, featured: !!brand.featured, order: newCurrentOrder });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Marcas Parceiras & Fabricantes</h3>
            <p className="text-xs text-slate-500">
              Gerencie as marcas em destaque com filtros automáticos no catálogo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Marca</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedBrands.map((b, idx) => (
          <div
            key={b.id}
            className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 ${
              b.active === false ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {b.logoUrl ? (
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-contain bg-slate-50 p-1 border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                  {b.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{b.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-400">#{b.order || idx + 1}</span>
                  {b.featured && (
                    <span className="inline-block text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      Destaque
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveOrder(b, 'up')}
                  className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  title="Subir posição"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === sortedBrands.length - 1}
                  onClick={() => handleMoveOrder(b, 'down')}
                  className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  title="Descer posição"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleBrandActive(b.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                  b.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {b.active !== false ? 'Ativa' : 'Inativa'}
              </button>

              <button
                type="button"
                onClick={() => handleStartEdit(b)}
                className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Excluir marca "${b.name}"?`)) deleteBrand(b.id);
                }}
                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditing && editingBrand && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {isNew ? 'Nova Marca' : 'Editar Marca'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Marca *</label>
                <input
                  type="text"
                  required
                  value={editingBrand.name || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="Ex: Premier, Royal Canin, Golden, Whiskas"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Logo da Marca (URL ou Arquivo)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingBrand.logoUrl || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, logoUrl: e.target.value })}
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
                            const compressed = await compressImage(file, { maxWidth: 500, maxHeight: 500, quality: 0.85 });
                            if (compressed) {
                              setEditingBrand((prev) => (prev ? { ...prev, logoUrl: compressed } : prev));
                            }
                          } catch (err) {
                            console.error('Erro ao comprimir logo da marca:', err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="brand-featured-check"
                  checked={!!editingBrand.featured}
                  onChange={(e) => setEditingBrand({ ...editingBrand, featured: e.target.checked })}
                  className="rounded text-[#0B2B6D] w-4 h-4"
                />
                <label htmlFor="brand-featured-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Marca em Destaque no Topo
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
