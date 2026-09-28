import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RotateCcw,
  Clock,
  ShoppingBag,
  ExternalLink,
  Receipt,
  MessageCircle,
  Package,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrdersHistoryModal: React.FC = () => {
  const {
    orders,
    isOrdersModalOpen,
    setIsOrdersModalOpen,
    repeatOrder,
    settings,
  } = useStore();

  if (!isOrdersModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" id="orders-history-modal-container">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setIsOrdersModalOpen(false)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          id="orders-history-modal"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-[#0B2B6D] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white leading-tight">
                  Histórico de Pedidos
                </h3>
                <p className="text-xs text-slate-200">
                  {orders.length} {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOrdersModalOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3"
                  id={`order-card-${order.orderNumber}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-black text-sm text-[#0B2B6D]">
                        #{order.orderNumber}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      Enviado pelo WhatsApp
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="border-t border-b border-slate-200/80 py-2.5 space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-slate-700"
                      >
                        <span className="line-clamp-1">
                          <strong className="text-slate-900">{item.quantity}x</strong>{' '}
                          {item.product.name} {item.variationName ? `(${item.variationName})` : ''}
                        </span>
                        <span className="font-semibold text-slate-900 shrink-0 ml-2">
                          {(item.unitPrice * item.quantity).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xs text-slate-500 block">Total do Pedido:</span>
                      <span className="text-base font-black text-slate-900">
                        {order.total.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const msg = `Olá! Gostaria de saber o status do meu pedido *#${order.orderNumber}* feito em ${order.customer.fullName}.`;
                          const phone = settings.primaryWhatsapp && !settings.primaryWhatsapp.includes('94624') ? settings.primaryWhatsapp : '5511975158424';
                          window.open(
                            `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`,
                            '_blank'
                          );
                        }}
                        className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Verificar status no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Status</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => repeatOrder(order)}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Pedir Novamente</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 space-y-3">
                <Package className="w-12 h-12 mx-auto text-slate-300" />
                <h4 className="font-bold text-slate-700 text-sm">
                  Nenhum pedido realizado ainda
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Assim que você finalizar seu primeiro pedido pelo WhatsApp, ele ficará salvo aqui para você poder repetir com 1 clique!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
