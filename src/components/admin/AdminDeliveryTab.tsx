import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Truck, DollarSign, Clock, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Neighborhood } from '../../types';

export const AdminDeliveryTab: React.FC = () => {
  const {
    neighborhoods,
    addNeighborhood,
    updateNeighborhood,
    deleteNeighborhood,
    toggleNeighborhoodActive,
    settings,
    updateSettings,
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingNeighborhood, setEditingNeighborhood] = useState<Partial<Neighborhood> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Store delivery settings
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    settings.freeDeliveryThreshold?.toString() || '150'
  );
  const [defaultEstimate, setDefaultEstimate] = useState(settings.deliveryEstimateText || '30 - 60 min');

  const handleStartCreate = () => {
    setEditingNeighborhood({
      name: '',
      fee: 5.0,
      estimatedTime: '30 - 60 min',
      active: true,
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (n: Neighborhood) => {
    setEditingNeighborhood({ ...n });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNeighborhood?.name || editingNeighborhood.fee === undefined) return;

    if (isNew) {
      addNeighborhood({
        name: editingNeighborhood.name,
        fee: Number(editingNeighborhood.fee),
        city: editingNeighborhood.city || 'São Paulo - SP',
        estimatedTime: editingNeighborhood.estimatedTime || '30 - 60 min',
      });
    } else if (editingNeighborhood.id) {
      updateNeighborhood({
        ...editingNeighborhood,
        id: editingNeighborhood.id,
        name: editingNeighborhood.name,
        fee: Number(editingNeighborhood.fee),
        city: editingNeighborhood.city || 'São Paulo - SP',
        estimatedTime: editingNeighborhood.estimatedTime || '30 - 60 min',
        active: editingNeighborhood.active ?? true,
      } as Neighborhood);
    }

    setIsEditing(false);
    setEditingNeighborhood(null);
  };

  const handleSaveDeliveryRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      freeDeliveryThreshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : undefined,
      deliveryEstimateText: defaultEstimate,
    });
  };

  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Global delivery policy card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-500" />
          <span>Regras Globais de Entrega & Frete Grátis</span>
        </h3>

        <form onSubmit={handleSaveDeliveryRules} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Frete Grátis a partir de (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              placeholder="Ex: 150.00"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
            />
            <span className="text-[11px] text-slate-400">Deixe vazio para desativar frete grátis</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tempo Padrão Estimado</label>
            <input
              type="text"
              value={defaultEstimate}
              onChange={(e) => setDefaultEstimate(e.target.value)}
              placeholder="Ex: 30 - 60 min"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
            >
              Salvar Regras
            </button>
          </div>
        </form>
      </div>

      {/* Neighborhoods List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0B2B6D]" />
            <h4 className="font-bold text-slate-900 text-sm">
              Bairros Atendidos ({neighborhoods.length})
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar bairro..."
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleStartCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Bairro</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {filteredNeighborhoods.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${
                n.active === false ? 'opacity-50' : ''
              }`}
            >
              <div>
                <h5 className="font-bold text-slate-900 text-sm">{n.name}</h5>
                <span className="text-xs text-slate-400">Tempo estimado: {n.estimatedTime || '30 - 60 min'}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-[#0B2B6D]">
                  {n.fee === 0
                    ? 'Grátis'
                    : n.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>

                <button
                  type="button"
                  onClick={() => toggleNeighborhoodActive(n.id)}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    n.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {n.active !== false ? 'Ativo' : 'Inativo'}
                </button>

                <button
                  type="button"
                  onClick={() => handleStartEdit(n)}
                  className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Excluir bairro "${n.name}"?`)) deleteNeighborhood(n.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEditing && editingNeighborhood && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {isNew ? 'Novo Bairro de Entrega' : 'Editar Bairro'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Bairro *</label>
                <input
                  type="text"
                  required
                  value={editingNeighborhood.name || ''}
                  onChange={(e) => setEditingNeighborhood({ ...editingNeighborhood, name: e.target.value })}
                  placeholder="Ex: Grajaú, Apurá"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Taxa de Entrega (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingNeighborhood.fee ?? ''}
                  onChange={(e) =>
                    setEditingNeighborhood({ ...editingNeighborhood, fee: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Ex: 5.00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tempo Estimado</label>
                <input
                  type="text"
                  value={editingNeighborhood.estimatedTime || '30 - 60 min'}
                  onChange={(e) =>
                    setEditingNeighborhood({ ...editingNeighborhood, estimatedTime: e.target.value })
                  }
                  placeholder="Ex: 30 - 60 min"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
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
