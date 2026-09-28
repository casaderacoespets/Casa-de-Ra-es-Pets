import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Menu, ArrowUp, ArrowDown, X, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MenuItem } from '../../types';

export const AdminMenuTab: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemActive } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleStartCreate = () => {
    setEditingItem({
      label: '',
      href: '#',
      type: 'catalog',
      order: menuItems.length + 1,
      active: true,
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.label) return;

    if (isNew) {
      addMenuItem({
        label: editingItem.label,
        href: editingItem.href || '#',
        icon: editingItem.icon,
        type: editingItem.type || 'catalog',
        targetValue: editingItem.targetValue,
        order: editingItem.order || menuItems.length + 1,
        active: editingItem.active ?? true,
      });
    } else if (editingItem.id) {
      updateMenuItem({
        ...editingItem,
        id: editingItem.id,
        label: editingItem.label,
        active: editingItem.active ?? true,
      } as MenuItem);
    }

    setIsEditing(false);
    setEditingItem(null);
  };

  const sortedMenuItems = [...menuItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-[#0B2B6D] rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Menu de Navegação Principal</h3>
            <p className="text-xs text-slate-500">
              Personalize os botões de atalho exibidos na barra superior do site.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2B6D] hover:bg-[#081F50] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Item ao Menu</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {sortedMenuItems.map((m, idx) => (
          <div
            key={m.id}
            className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${
              m.active === false ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{m.icon || '🔗'}</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{m.label}</h4>
                <span className="text-xs text-slate-400">Tipo: {m.type} • Ordem: #{m.order || idx + 1}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleMenuItemActive(m.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                  m.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {m.active !== false ? 'Ativo' : 'Inativo'}
              </button>

              <button
                type="button"
                onClick={() => handleStartEdit(m)}
                className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Excluir item "${m.label}"?`)) deleteMenuItem(m.id);
                }}
                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditing && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {isNew ? 'Novo Item de Menu' : 'Editar Item de Menu'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Link *</label>
                <input
                  type="text"
                  required
                  value={editingItem.label || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  placeholder="Ex: Cães & Gatos, Ofertas do Dia"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ícone / Emoji</label>
                  <input
                    type="text"
                    value={editingItem.icon || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                    placeholder="Ex: 🐶, 🔥, 📍"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Ação</label>
                  <select
                    value={editingItem.type || 'catalog'}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="catalog">Catálogo</option>
                    <option value="stores">Loja Física</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="offers">Apenas Ofertas</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="menu-active-check"
                  checked={editingItem.active !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                  className="rounded text-[#0B2B6D] w-4 h-4"
                />
                <label htmlFor="menu-active-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Item Visível no Menu
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
