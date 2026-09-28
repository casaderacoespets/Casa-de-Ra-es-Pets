import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, ArrowUp, ArrowDown, Check, X, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomCategory, PetSpecies, ProductCategory } from '../../types';

export const AdminCategoriesTab: React.FC = () => {
  const {
    customCategories,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    toggleCustomCategoryActive,
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CustomCategory> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleStartCreate = () => {
    setEditingCategory({
      label: '',
      sublabel: 'Produtos e acessórios',
      emoji: '🐾',
      type: 'species',
      targetKey: 'caes',
      bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-950',
      iconBg: 'bg-amber-400/20 text-amber-700',
      order: customCategories.length + 1,
      active: true,
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (cat: CustomCategory) => {
    setEditingCategory({
      ...cat,
      label: cat.label || (cat as any).name || '',
      emoji: cat.emoji || (cat as any).icon || '🐾',
      sublabel: cat.sublabel || '',
      type: cat.type || 'species',
      targetKey: cat.targetKey || (cat as any).species || 'caes',
      bgColor: cat.bgColor || 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-950',
      iconBg: cat.iconBg || 'bg-amber-400/20 text-amber-700',
    });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleMoveOrder = (cat: CustomCategory, direction: 'up' | 'down') => {
    const sorted = [...customCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sorted.findIndex((c) => c.id === cat.id);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex > 0) {
      const prev = sorted[currentIndex - 1];
      const tempOrder = prev.order || currentIndex;
      updateCustomCategory({ ...prev, order: cat.order || currentIndex + 1 });
      updateCustomCategory({ ...cat, order: tempOrder });
    } else if (direction === 'down' && currentIndex < sorted.length - 1) {
      const next = sorted[currentIndex + 1];
      const tempOrder = next.order || currentIndex + 2;
      updateCustomCategory({ ...next, order: cat.order || currentIndex + 1 });
      updateCustomCategory({ ...cat, order: tempOrder });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.label) return;

    const targetKey =
      editingCategory.targetKey ||
      editingCategory.label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-');

    if (isNew) {
      addCustomCategory({
        label: editingCategory.label,
        sublabel: editingCategory.sublabel || 'Linha completa e novidades',
        emoji: editingCategory.emoji || '🐾',
        type: editingCategory.type || 'species',
        targetKey,
        bgColor: editingCategory.bgColor || 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-950',
        iconBg: editingCategory.iconBg || 'bg-amber-400/20 text-amber-700',
        order: editingCategory.order || customCategories.length + 1,
        active: editingCategory.active ?? true,
      });
    } else if (editingCategory.id) {
      updateCustomCategory({
        ...editingCategory,
        id: editingCategory.id,
        label: editingCategory.label,
        sublabel: editingCategory.sublabel || '',
        emoji: editingCategory.emoji || '🐾',
        type: editingCategory.type || 'species',
        targetKey,
        bgColor: editingCategory.bgColor || 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-950',
        iconBg: editingCategory.iconBg || 'bg-amber-400/20 text-amber-700',
        order: editingCategory.order || 1,
        active: editingCategory.active ?? true,
      } as CustomCategory);
    }

    setIsEditing(false);
    setEditingCategory(null);
  };

  const sortedCategories = [...customCategories].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-[#0B2B6D] rounded-xl">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Categorias & Espécies do Site</h3>
            <p className="text-xs text-slate-500">
              Personalize o menu de categorias, filtros e atalhos da página inicial.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Categoria</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {sortedCategories.map((cat, idx) => {
            const displayLabel = cat.label || (cat as any).name || 'Sem nome';
            const displayEmoji = cat.emoji || (cat as any).icon || '🐾';
            const displaySub = cat.sublabel || (cat as any).species || '';

            return (
              <div
                key={cat.id}
                className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${
                  cat.active === false ? 'opacity-50 bg-slate-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                    {displayEmoji}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{displayLabel}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="truncate">{displaySub}</span>
                      <span>•</span>
                      <span>Tipo: <strong className="text-slate-600 capitalize">{cat.type === 'category' ? 'Categoria' : 'Espécie'}</strong> ({cat.targetKey})</span>
                      <span>•</span>
                      <span>Ordem: #{cat.order || idx + 1}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(cat, 'up')}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                      title="Mover para Cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sortedCategories.length - 1}
                      onClick={() => handleMoveOrder(cat, 'down')}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                      title="Mover para Baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Active */}
                  <button
                    type="button"
                    onClick={() => toggleCustomCategoryActive(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                      cat.active !== false
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {cat.active !== false ? 'Ativa' : 'Inativa'}
                  </button>

                  {/* Edit & Delete */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cat)}
                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Deseja remover a categoria "${displayLabel}"?`)) {
                        deleteCustomCategory(cat.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Edit / Create Category */}
      {isEditing && editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {isNew ? 'Nova Categoria' : 'Editar Categoria'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Categoria (Título) *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.label || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, label: e.target.value })}
                  placeholder="Ex: Cães & Filhotes, Farmácia Felina"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo / Descrição Curta</label>
                <input
                  type="text"
                  value={editingCategory.sublabel || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, sublabel: e.target.value })}
                  placeholder="Ex: Rações premium, petiscos e sachês"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ícone / Emoji</label>
                  <input
                    type="text"
                    value={editingCategory.emoji || '🐾'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, emoji: e.target.value })}
                    placeholder="Ex: 🐶, 🐱, 💊"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Filtro</label>
                  <select
                    value={editingCategory.type || 'species'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, type: e.target.value as 'species' | 'category' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="species">Espécie Pet</option>
                    <option value="category">Linha / Categoria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Identificador de Filtro (targetKey)</label>
                <input
                  type="text"
                  value={editingCategory.targetKey || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, targetKey: e.target.value })}
                  placeholder="Ex: caes, gatos, aves, farmacia, racoes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cat-active-check"
                  checked={editingCategory.active !== false}
                  onChange={(e) => setEditingCategory({ ...editingCategory, active: e.target.checked })}
                  className="rounded text-[#0B2B6D] w-4 h-4"
                />
                <label htmlFor="cat-active-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Categoria Ativa no Site
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
