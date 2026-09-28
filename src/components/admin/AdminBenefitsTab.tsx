import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SiteBenefit } from '../../types';

export const AdminBenefitsTab: React.FC = () => {
  const {
    benefits,
    addBenefit,
    updateBenefit,
    deleteBenefit,
    toggleBenefitActive,
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Partial<SiteBenefit> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleStartCreate = () => {
    setEditingBenefit({
      title: '',
      description: '',
      iconName: 'Truck',
      iconColor: 'text-amber-500 bg-amber-50',
      actionType: 'none',
      order: benefits.length + 1,
      active: true,
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (b: SiteBenefit) => {
    setEditingBenefit({ ...b });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleMoveOrder = (ben: SiteBenefit, direction: 'up' | 'down') => {
    const sorted = [...benefits].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sorted.findIndex((b) => b.id === ben.id);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex > 0) {
      const prev = sorted[currentIndex - 1];
      const tempOrder = prev.order || currentIndex;
      updateBenefit({ ...prev, order: ben.order || currentIndex + 1 });
      updateBenefit({ ...ben, order: tempOrder });
    } else if (direction === 'down' && currentIndex < sorted.length - 1) {
      const next = sorted[currentIndex + 1];
      const tempOrder = next.order || currentIndex + 2;
      updateBenefit({ ...next, order: ben.order || currentIndex + 1 });
      updateBenefit({ ...ben, order: tempOrder });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBenefit?.title) return;

    if (isNew) {
      addBenefit({
        title: editingBenefit.title,
        description: editingBenefit.description || '',
        iconName: editingBenefit.iconName || 'Truck',
        iconColor: editingBenefit.iconColor || 'text-amber-500 bg-amber-50',
        actionType: editingBenefit.actionType || 'none',
        order: editingBenefit.order || benefits.length + 1,
        active: editingBenefit.active ?? true,
      });
    } else if (editingBenefit.id) {
      updateBenefit({
        ...editingBenefit,
        id: editingBenefit.id,
        title: editingBenefit.title,
        active: editingBenefit.active ?? true,
      } as SiteBenefit);
    }

    setIsEditing(false);
    setEditingBenefit(null);
  };

  const sortedBenefits = [...benefits].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Barra de Benefícios & Vantagens</h3>
            <p className="text-xs text-slate-500">
              Personalize os destaques de confiança exibidos logo abaixo do banner Hero.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Benefício</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {sortedBenefits.map((b, idx) => (
          <div
            key={b.id}
            className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${
              b.active === false ? 'opacity-50 bg-slate-50/50' : ''
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {b.iconName}
                </span>
                <h4 className="font-bold text-slate-900 text-sm truncate">{b.title}</h4>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">{b.description}</p>
            </div>

            <div className="flex items-center gap-2">
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
                  disabled={idx === sortedBenefits.length - 1}
                  onClick={() => handleMoveOrder(b, 'down')}
                  className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  title="Mover para Baixo"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleBenefitActive(b.id)}
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
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Deseja remover "${b.title}"?`)) {
                    deleteBenefit(b.id);
                  }
                }}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditing && editingBenefit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {isNew ? 'Novo Benefício' : 'Editar Benefício'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={editingBenefit.title || ''}
                  onChange={(e) => setEditingBenefit({ ...editingBenefit, title: e.target.value })}
                  placeholder="Ex: Temos Entrega Rápida"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Curta</label>
                <input
                  type="text"
                  value={editingBenefit.description || ''}
                  onChange={(e) => setEditingBenefit({ ...editingBenefit, description: e.target.value })}
                  placeholder="Ex: Taxa fixa transparente por bairro..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ícone</label>
                  <select
                    value={editingBenefit.iconName || 'Truck'}
                    onChange={(e) => setEditingBenefit({ ...editingBenefit, iconName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="Activity">Clínica / Saúde (Activity)</option>
                    <option value="Scissors">Banho & Tosa (Scissors)</option>
                    <option value="Truck">Caminhão de Entrega (Truck)</option>
                    <option value="MessageCircle">WhatsApp (MessageCircle)</option>
                    <option value="Store">Loja Física (Store)</option>
                    <option value="ShieldCheck">Garantia / Selo (ShieldCheck)</option>
                    <option value="Heart">Coração (Heart)</option>
                    <option value="Clock">Horário / Relógio (Clock)</option>
                    <option value="Sparkles">Estrela (Sparkles)</option>
                    <option value="Tag">Desconto (Tag)</option>
                    <option value="CreditCard">Cartão (CreditCard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ação ao Clicar</label>
                  <select
                    value={editingBenefit.actionType || 'none'}
                    onChange={(e) => setEditingBenefit({ ...editingBenefit, actionType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="none">Nenhuma (Apenas informativo)</option>
                    <option value="whatsapp">Abrir WhatsApp</option>
                    <option value="stores">Abrir Loja Física</option>
                    <option value="catalog">Rolar até Catálogo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ben-active-check"
                  checked={editingBenefit.active !== false}
                  onChange={(e) => setEditingBenefit({ ...editingBenefit, active: e.target.checked })}
                  className="rounded text-[#0B2B6D] w-4 h-4"
                />
                <label htmlFor="ben-active-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Benefício Ativo na Barra
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
