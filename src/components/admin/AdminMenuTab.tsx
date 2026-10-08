import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Menu, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MenuItem } from '../../types';

const TARGET_TYPE_LABELS: Record<string, string> = {
  species: 'Espécie (Catálogo)',
  category: 'Categoria (Catálogo)',
  offers: 'Ofertas do Dia',
  section: 'Seção da Página',
  stores: 'Loja Física (Modal)',
  whatsapp: 'WhatsApp',
  catalog: 'Catálogo Geral',
  external: 'Link Externo (URL)',
};

export const AdminMenuTab: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemActive } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const sortedMenuItems = [...menuItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleStartCreate = () => {
    setEditingItem({
      label: '',
      emoji: '🐾',
      icon: '🐾',
      targetType: 'species',
      type: 'species',
      targetValue: 'caes',
      href: '#',
      order: menuItems.length + 1,
      active: true,
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (item: MenuItem) => {
    const resolvedType = item.targetType || item.type || 'catalog';
    const resolvedEmoji = item.emoji || item.icon || '🐾';
    let defaultTargetValue = item.targetValue || '';
    if (!defaultTargetValue) {
      if (resolvedType === 'species') defaultTargetValue = 'caes';
      else if (resolvedType === 'category') defaultTargetValue = 'racoes';
      else if (resolvedType === 'section') defaultTargetValue = 'services-section';
      else if (resolvedType === 'external') defaultTargetValue = item.href || 'https://';
    }

    setEditingItem({
      ...item,
      emoji: resolvedEmoji,
      icon: resolvedEmoji,
      targetType: resolvedType,
      type: resolvedType,
      targetValue: defaultTargetValue,
    });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleMoveOrder = (item: MenuItem, direction: 'up' | 'down') => {
    const currentIndex = sortedMenuItems.findIndex((m) => m.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedMenuItems.length) return;

    const neighbor = sortedMenuItems[targetIndex];
    const currentOrder = item.order || currentIndex + 1;
    const neighborOrder = neighbor.order || targetIndex + 1;

    const newCurrentOrder =
      currentOrder === neighborOrder ? targetIndex + 1 : neighborOrder;
    const newNeighborOrder =
      currentOrder === neighborOrder ? currentIndex + 1 : currentOrder;

    updateMenuItem({ ...neighbor, order: newNeighborOrder });
    updateMenuItem({ ...item, order: newCurrentOrder });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.label) return;

    const finalType = editingItem.targetType || editingItem.type || 'catalog';
    const finalEmoji = editingItem.emoji || editingItem.icon || '🐾';
    const finalTargetValue = editingItem.targetValue || '';
    const finalHref =
      finalType === 'external'
        ? finalTargetValue || editingItem.href || '#'
        : editingItem.href || '#';

    if (isNew) {
      addMenuItem({
        label: editingItem.label,
        emoji: finalEmoji,
        icon: finalEmoji,
        targetType: finalType,
        type: finalType,
        targetValue: finalTargetValue,
        href: finalHref,
        order: editingItem.order || menuItems.length + 1,
        active: editingItem.active ?? true,
      });
    } else if (editingItem.id) {
      updateMenuItem({
        ...editingItem,
        id: editingItem.id,
        label: editingItem.label,
        emoji: finalEmoji,
        icon: finalEmoji,
        targetType: finalType,
        type: finalType,
        targetValue: finalTargetValue,
        href: finalHref,
        order: editingItem.order || 1,
        active: editingItem.active ?? true,
      } as MenuItem);
    }

    setIsEditing(false);
    setEditingItem(null);
  };

  const handleTypeChange = (newType: MenuItem['targetType']) => {
    let defaultVal = editingItem?.targetValue || '';
    if (newType === 'species') defaultVal = 'caes';
    else if (newType === 'category') defaultVal = 'racoes';
    else if (newType === 'offers') defaultVal = 'offers';
    else if (newType === 'stores') defaultVal = 'stores';
    else if (newType === 'whatsapp') defaultVal = 'whatsapp';
    else if (newType === 'section') defaultVal = 'services-section';
    else if (newType === 'catalog') defaultVal = 'all';
    else if (newType === 'external') defaultVal = editingItem?.href && editingItem.href !== '#' ? editingItem.href : 'https://';

    setEditingItem((prev) =>
      prev
        ? {
            ...prev,
            targetType: newType,
            type: newType,
            targetValue: defaultVal,
          }
        : prev
    );
  };

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
              Personalize os botões exibidos no menu do cabeçalho (desktop e celular).
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
        {sortedMenuItems.map((m, idx) => {
          const displayEmoji = m.emoji || m.icon || '🐾';
          const displayType = m.targetType || m.type || 'catalog';
          return (
            <div
              key={m.id}
              className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${
                m.active === false ? 'opacity-50 bg-slate-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg shrink-0">{displayEmoji}</span>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{m.label}</h4>
                  <span className="text-xs text-slate-400">
                    {TARGET_TYPE_LABELS[displayType] || displayType}
                    {m.targetValue ? ` (${m.targetValue})` : ''} • Ordem: #{m.order || idx + 1}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveOrder(m, 'up')}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    title="Mover para Cima"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sortedMenuItems.length - 1}
                    onClick={() => handleMoveOrder(m, 'down')}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    title="Mover para Baixo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

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
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Excluir item "${m.label}"?`)) deleteMenuItem(m.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
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
                  placeholder="Ex: Cães, Gatos, Ofertas do Dia"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ícone / Emoji</label>
                  <input
                    type="text"
                    value={editingItem.emoji ?? editingItem.icon ?? ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, emoji: e.target.value, icon: e.target.value })
                    }
                    placeholder="Ex: 🐶, 🐱, 🔥, 💊"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Destino</label>
                  <select
                    value={editingItem.targetType || editingItem.type || 'species'}
                    onChange={(e) => handleTypeChange(e.target.value as MenuItem['targetType'])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="species">Espécie (Catálogo)</option>
                    <option value="category">Categoria (Catálogo)</option>
                    <option value="offers">Ofertas do Dia</option>
                    <option value="section">Seção da Página</option>
                    <option value="stores">Loja Física</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="catalog">Catálogo Geral</option>
                    <option value="external">Link Externo (URL)</option>
                  </select>
                </div>
              </div>

              {(editingItem.targetType === 'species' || editingItem.type === 'species') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Espécie de Destino</label>
                  <select
                    value={editingItem.targetValue || 'caes'}
                    onChange={(e) => setEditingItem({ ...editingItem, targetValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="caes">Cães</option>
                    <option value="gatos">Gatos</option>
                    <option value="aves">Aves</option>
                    <option value="peixes">Peixes & Aquários</option>
                    <option value="outros">Pequenos Animais</option>
                  </select>
                </div>
              )}

              {(editingItem.targetType === 'category' || editingItem.type === 'category') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria de Destino</label>
                  <select
                    value={editingItem.targetValue || 'racoes'}
                    onChange={(e) => setEditingItem({ ...editingItem, targetValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="racoes">Rações & Alimentos</option>
                    <option value="farmacia">Farmácia Pet & Antipulgas</option>
                    <option value="petiscos">Petiscos & Snacks</option>
                    <option value="higiene">Higiene & Tapetes</option>
                    <option value="brinquedos">Brinquedos</option>
                    <option value="camas-casinhas">Caminhas & Casinhas</option>
                    <option value="gaiolas">Gaiolas & Viveiros</option>
                    <option value="aquarios-filtros">Aquários & Filtros</option>
                    <option value="acessorios">Acessórios</option>
                  </select>
                </div>
              )}

              {(editingItem.targetType === 'section' || editingItem.type === 'section') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seção da Página</label>
                  <select
                    value={editingItem.targetValue || 'services-section'}
                    onChange={(e) => setEditingItem({ ...editingItem, targetValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="services-section">Serviços & Clínica 24h</option>
                    <option value="featured-brands-section">Marcas em Destaque</option>
                    <option value="offers-section">Ofertas Imperdíveis</option>
                    <option value="bestsellers-section">Os Mais Vendidos</option>
                    <option value="pharmacy-section">Farmácia Pet & Antipulgas</option>
                    <option value="catalog-section">Catálogo Completo</option>
                    <option value="main-footer">Rodapé / Contato</option>
                  </select>
                </div>
              )}

              {(editingItem.targetType === 'whatsapp' || editingItem.type === 'whatsapp') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destino da Ação</label>
                  <select
                    value={editingItem.targetValue || 'whatsapp'}
                    onChange={(e) => setEditingItem({ ...editingItem, targetValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  >
                    <option value="whatsapp">Abrir WhatsApp Oficial</option>
                    <option value="services">Rolar até Seção de Serviços</option>
                  </select>
                </div>
              )}

              {(editingItem.targetType === 'external' || editingItem.type === 'external') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL do Link Externo *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.targetValue || editingItem.href || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, targetValue: e.target.value, href: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0B2B6D]"
                  />
                </div>
              )}

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
