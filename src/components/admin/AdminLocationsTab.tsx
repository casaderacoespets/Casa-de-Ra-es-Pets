import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Store, MapPin, Phone, Clock, X, MessageCircle, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreLocation } from '../../types';

export const AdminLocationsTab: React.FC = () => {
  const { storeLocations, addStoreLocation, updateStoreLocation, deleteStoreLocation } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Partial<StoreLocation> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleStartCreate = () => {
    setEditingLoc({
      name: '',
      address: '',
      neighborhood: '',
      city: 'São Paulo - SP',
      phone: '(11) 2495-0511',
      whatsapp: '11975158424',
      hours: 'Clínica Veterinária: 24 Horas (Plantão) • Pet Shop & Banho e Tosa: Seg a Sáb 08h às 19h30',
      mapsUrl: '',
      isActive: true,
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (loc: StoreLocation) => {
    setEditingLoc({ ...loc });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoc?.name || !editingLoc.address) return;

    if (isNew) {
      addStoreLocation({
        name: editingLoc.name,
        address: editingLoc.address,
        neighborhood: editingLoc.neighborhood || '',
        city: editingLoc.city || 'São Paulo - SP',
        phone: editingLoc.phone || '(11) 2495-0511',
        whatsapp: editingLoc.whatsapp || '5511975158424',
        hours: editingLoc.hours || 'Clínica: 24 Horas • Pet Shop: Seg a Sáb 08h às 19h30',
        mapsUrl: editingLoc.mapsUrl || '',
        mapUrl: editingLoc.mapsUrl || '',
        isActive: editingLoc.isActive ?? true,
      });
    } else if (editingLoc.id) {
      updateStoreLocation({
        ...editingLoc,
        id: editingLoc.id,
        mapUrl: editingLoc.mapsUrl || editingLoc.mapUrl || '',
        isActive: editingLoc.isActive ?? true,
      } as StoreLocation);
    }

    setIsEditing(false);
    setEditingLoc(null);
  };

  const handleToggleActive = (loc: StoreLocation) => {
    updateStoreLocation({
      ...loc,
      isActive: loc.isActive === false ? true : false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-[#0B2B6D] rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Endereço da Loja Física</h3>
            <p className="text-xs text-slate-500">
              Endereço oficial, telefone e horários exibidos no modal e rodapé.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Unidade</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storeLocations.map((loc) => (
          <div
            key={loc.id}
            className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 ${
              loc.isActive === false ? 'opacity-60 bg-slate-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-500" />
                <span>{loc.name}</span>
              </h4>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleActive(loc)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                    loc.isActive !== false
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {loc.isActive !== false ? 'Ativa' : 'Inativa'}
                </button>
                <button
                  type="button"
                  onClick={() => handleStartEdit(loc)}
                  className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg cursor-pointer"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Excluir unidade "${loc.name}"?`)) deleteStoreLocation(loc.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {loc.address}, {loc.neighborhood} - {loc.city}
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{loc.phone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{loc.hours}</span>
              </p>
              {(loc.mapUrl || loc.mapsUrl) && (
                <p className="flex items-center gap-1.5 text-[#0B2B6D]">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <a href={loc.mapUrl || loc.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Ver link no Google Maps
                  </a>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditing && editingLoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {isNew ? 'Nova Unidade' : 'Editar Unidade'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Unidade *</label>
                <input
                  type="text"
                  required
                  value={editingLoc.name || ''}
                  onChange={(e) => setEditingLoc({ ...editingLoc, name: e.target.value })}
                  placeholder="Ex: Pet's Family — Clínica 24h & Pet Shop"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Endereço Completo *</label>
                <input
                  type="text"
                  required
                  value={editingLoc.address || ''}
                  onChange={(e) => setEditingLoc({ ...editingLoc, address: e.target.value })}
                  placeholder="Ex: Av. Dona Belmira Marin, 3618 - Loja 1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={editingLoc.neighborhood || ''}
                    onChange={(e) => setEditingLoc({ ...editingLoc, neighborhood: e.target.value })}
                    placeholder="Ex: Grajaú"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / Whats</label>
                  <input
                    type="text"
                    value={editingLoc.phone || ''}
                    onChange={(e) => setEditingLoc({ ...editingLoc, phone: e.target.value })}
                    placeholder="(11) 2495-0511 / (11) 97515-8424"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Horário de Funcionamento</label>
                <input
                  type="text"
                  value={editingLoc.hours || ''}
                  onChange={(e) => setEditingLoc({ ...editingLoc, hours: e.target.value })}
                  placeholder="Clínica Veterinária: 24 Horas (Plantão) • Pet Shop: Seg a Sáb 08h às 19h30"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link do Google Maps / Rotas (Opcional)</label>
                <input
                  type="text"
                  value={editingLoc.mapsUrl || editingLoc.mapUrl || ''}
                  onChange={(e) => setEditingLoc({ ...editingLoc, mapsUrl: e.target.value, mapUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="loc-active-check"
                  checked={editingLoc.isActive !== false}
                  onChange={(e) => setEditingLoc({ ...editingLoc, isActive: e.target.checked })}
                  className="rounded text-[#0B2B6D] w-4 h-4"
                />
                <label htmlFor="loc-active-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Unidade Ativa
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
