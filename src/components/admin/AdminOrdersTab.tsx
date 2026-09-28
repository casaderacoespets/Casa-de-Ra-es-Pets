import React, { useState } from 'react';
import { ShoppingBag, Search, MessageCircle, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

export const AdminOrdersTab: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, clearAllOrders, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.whatsapp?.includes(searchTerm)
  );

  const statusOptions: { value: Order['status']; label: string; color: string }[] = [
    { value: 'enviado_whatsapp', label: 'Enviado WhatsApp', color: 'bg-amber-100 text-amber-800' },
    { value: 'confirmado', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
    { value: 'em_preparo', label: 'Em Preparo', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'em_entrega', label: 'Saiu para Entrega', color: 'bg-purple-100 text-purple-800' },
    { value: 'concluido', label: 'Concluído', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-rose-100 text-rose-800' },
  ];

  const handleWhatsAppContact = (order: Order) => {
    const cleanPhone = order.customer.whatsapp?.replace(/\D/g, '') || '';
    const phoneToUse = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${order.customer.fullName}! Aqui é da *${settings.storeName}*. Estamos entrando em contato sobre o seu pedido *#${order.orderNumber || order.id}*.`
    );
    window.open(`https://wa.me/${phoneToUse}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Pedidos Recebidos</h3>
            <p className="text-xs text-slate-500">
              {orders.length} pedidos registrados na loja.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, pedido..."
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
          />

          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja limpar todo o histórico de pedidos?')) clearAllOrders();
              }}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
            >
              Limpar Histórico
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhum pedido encontrado. Quando clientes finalizarem pedidos, eles aparecerão aqui.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((o) => (
              <div key={o.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-[#0B2B6D]">#{o.orderNumber || o.id}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(o.createdAt).toLocaleString('pt-BR')}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      • {o.customer.fullName} ({o.customer.whatsapp})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 truncate max-w-lg">
                    {o.items.map((it) => `${it.quantity}x ${it.product.name}${it.variationName ? ` (${it.variationName})` : ''}`).join(', ')}
                  </p>

                  <div className="text-xs text-slate-500">
                    Bairro: <strong>{o.neighborhoodName || o.customer.neighborhoodId || 'Não especificado'}</strong> • Pagamento:{' '}
                    <strong className="uppercase">{o.payment?.method || 'WhatsApp'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className="font-black text-sm text-slate-900">
                    {o.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>

                  <select
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppContact(o)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                    title="Chamar cliente no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Excluir pedido #${o.orderNumber || o.id}?`)) deleteOrder(o.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
