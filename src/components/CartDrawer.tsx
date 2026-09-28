import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  MapPin,
  Sparkles,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    freeDeliveryRemaining,
    neighborhoods,
    selectedNeighborhoodId,
    setSelectedNeighborhoodId,
    setIsCheckoutOpen,
    settings,
  } = useStore();

  const selectedNeighborhood = neighborhoods.find((n) => n.id === selectedNeighborhoodId);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end" id="cart-drawer-wrapper">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
          id="cart-drawer-panel"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center border border-[#D4AF37]/40">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 leading-tight">
                  Meu Carrinho
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {cart.length} {cart.length === 1 ? 'item adicionado' : 'itens adicionados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Esvaziar carrinho"
                >
                  Limpar
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Fechar carrinho"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Indicator */}
          {settings.freeDeliveryThreshold && (
            <div className="bg-amber-50/80 px-4 py-2.5 border-b border-amber-200/50">
              {freeDeliveryRemaining > 0 ? (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-950 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      Falta apenas{' '}
                      <span className="font-extrabold text-amber-900">
                        {freeDeliveryRemaining.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>{' '}
                      para <span className="text-emerald-700">FRETE GRÁTIS!</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((settings.freeDeliveryThreshold - freeDeliveryRemaining) /
                            settings.freeDeliveryThreshold) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Parabéns! Você ganhou FRETE GRÁTIS na sua entrega! 🎉</span>
                </div>
              )}
            </div>
          )}

          {/* Cart Item List / Empty State */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variationId || 'base'}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all"
                  id={`cart-item-${item.productId}`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 shrink-0 overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1 leading-tight">
                      {item.product.name}
                    </h4>

                    {item.variationName && (
                      <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5">
                        {item.variationName}
                      </span>
                    )}

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-black text-xs text-slate-900">
                        {(item.unitPrice * item.quantity).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-slate-400">
                          ({item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} un.)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.productId, item.variationId, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-6 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.productId, item.variationId, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.variationId)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-0.5 transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-4" id="empty-cart-state">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-10 h-10 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-800">
                    Seu carrinho está vazio
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Explore nossas rações, petiscos e medicamentos para seu pet com entrega rápida!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md border border-[#D4AF37]/30 cursor-pointer"
                >
                  Ver Produtos
                </button>
              </div>
            )}
          </div>

          {/* Footer with Neighborhood Delivery & Subtotal Breakdown */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3">
              {/* Delivery Neighborhood Select */}
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    Bairro de Entrega em SP:
                  </span>
                  <span className="text-amber-700 font-extrabold">
                    {deliveryFee === 0
                      ? 'Grátis'
                      : deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <select
                  value={selectedNeighborhoodId}
                  onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-amber-500 cursor-pointer"
                  id="cart-neighborhood-select"
                >
                  {neighborhoods
                    .filter((n) => n.active)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} — Taxa:{' '}
                        {n.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({n.estimatedTime})
                      </option>
                    ))}
                </select>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Taxa de Entrega ({selectedNeighborhood?.name || 'Região'})</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-extrabold">Grátis</span>
                    ) : (
                      deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    )}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Total</span>
                  <span className="text-amber-600 font-black">
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-600 font-semibold text-right">
                  {(total * 0.95).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no PIX (5% de desconto)
                </p>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-sm rounded-xl shadow-lg hover:shadow-amber-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="cart-checkout-btn"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
              >
                Continuar comprando
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
