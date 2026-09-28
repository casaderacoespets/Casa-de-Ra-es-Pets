import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Phone,
  Sparkles,
  Info,
  CheckCircle2,
  ZoomIn,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getEffectiveProductPricing } from '../utils/pricing';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    setZoomedImage,
    addToCart,
    settings,
  } = useStore();

  const product = selectedProductForModal;

  const [selectedVariationId, setSelectedVariationId] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const prevProductIdRef = useRef<string | null>(null);

  // Sync variation when a different product is selected
  useEffect(() => {
    if (product) {
      if (prevProductIdRef.current !== product.id) {
        prevProductIdRef.current = product.id;
        setQty(1);
        if (product.variations && product.variations.length > 0) {
          setSelectedVariationId(product.variations[0].id);
        } else {
          setSelectedVariationId(undefined);
        }
      } else {
        // If same product is updated in Firestore while modal is open:
        if (product.variations && product.variations.length > 0) {
          setSelectedVariationId((prev) =>
            product.variations!.some((v) => v.id === prev) ? prev : product.variations![0].id
          );
        } else {
          setSelectedVariationId(undefined);
        }
      }
    } else {
      prevProductIdRef.current = null;
    }
  }, [product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProductForModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedProductForModal]);

  if (!product) return null;

  const pricing = getEffectiveProductPricing(product, selectedVariationId);
  const {
    effectivePrice: currentPrice,
    effectiveOriginalPrice: currentOriginalPrice,
    effectiveVariationId,
    selectedVariation,
    hasVariations,
    discountPercent,
    pixPrice,
  } = pricing;

  console.log('[TRACE PUBLIC PRODUCT]', {
    source: 'ProductDetailModal',
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    isPromo: product.isPromo,
    variations: product.variations,
    selectedVariation: selectedVariation?.name,
    effectiveVariationId,
    effectivePrice: currentPrice,
    effectiveOriginalPrice: currentOriginalPrice,
    pixPrice,
  });

  const handleAddAndClose = () => {
    addToCart(product, effectiveVariationId, qty);
    setSelectedProductForModal(null);
  };

  const handleWhatsAppInquiry = () => {
    const msg = `Olá! Gostaria de informações sobre o produto: *${product.name}* (Marca: ${product.brand}${
      selectedVariation ? `, Variação: ${selectedVariation.name}` : ''
    }) na Pet's Family.`;
    const phone = settings.primaryWhatsapp && !settings.primaryWhatsapp.includes('94624') ? settings.primaryWhatsapp : '5511975158424';
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" id="product-detail-modal-container">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setSelectedProductForModal(null)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          id="product-detail-modal"
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setSelectedProductForModal(null)}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {/* Left Column: Image & Highlights */}
              <div className="space-y-4">
                <div
                  onClick={() => {
                    if (product.image) {
                      setZoomedImage({
                        src: product.image,
                        alt: product.name,
                        title: product.name,
                      });
                    }
                  }}
                  className="group/img relative w-full pt-[90%] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner cursor-zoom-in"
                  title="Clique para ampliar a foto"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (product.image) {
                        setZoomedImage({
                          src: product.image,
                          alt: product.name,
                          title: product.name,
                        });
                      }
                    }
                  }}
                  aria-label={`Ampliar foto de ${product.name}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-300"
                  />
                  {/* Subtle Zoom Badge Hint */}
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-xs shadow-md flex items-center gap-1.5 transform scale-95 group-hover/img:scale-100 transition-transform">
                      <ZoomIn className="w-3.5 h-3.5" /> Ampliar foto
                    </span>
                  </div>
                  {product.isPromo && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                      OFERTA ESPECIAL
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 pointer-events-none">
                      <Sparkles className="w-3.5 h-3.5" /> MAIS VENDIDO
                    </span>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Entrega rápida por motoboy</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Produto original garantido</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Information & Purchase Actions */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* Brand & Reviews */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md">
                      {product.brand}
                    </span>
                    {product.rating && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(product.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                        <span className="text-slate-400">({product.reviewCount || 24} avaliações)</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight mb-3">
                    {product.name}
                  </h2>

                  {/* Pricing */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                    {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 line-through">
                        <span>
                          De {currentOriginalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded no-underline">
                          Economia de {(currentOriginalPrice - currentPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-black text-[#0B2B6D]">
                        {currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">no cartão ou dinheiro</span>
                    </div>

                    <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        {pixPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} à vista no PIX (5% de desconto)
                      </span>
                    </p>
                  </div>

                  {/* Variations / Sizes */}
                  {product.variations && product.variations.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Selecione a Embalagem / Tamanho:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.variations.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariationId(v.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              effectiveVariationId === v.id
                                ? 'bg-[#0B2B6D] text-white border-[#0B2B6D] shadow-md scale-105'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{v.name}</span>
                              <span className="opacity-80">
                                ({v.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity and Add to Cart Row */}
                  <div className="flex items-center gap-3 pt-2 mb-4">
                    <div className="flex items-center border-2 border-slate-200 rounded-xl bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-extrabold text-sm text-slate-900">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty((prev) => prev + 1)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAndClose}
                      disabled={product.stock <= 0}
                      className="flex-1 py-3.5 px-5 rounded-xl bg-[#0B2B6D] hover:bg-[#081F50] active:scale-[0.98] disabled:bg-slate-300 text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      id="modal-add-to-cart-btn"
                    >
                      <ShoppingBag className="w-5 h-5 text-amber-300" />
                      <span>Adicionar ao Carrinho • {(currentPrice * qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </button>
                  </div>

                  {/* Direct WhatsApp button */}
                  <button
                    type="button"
                    onClick={handleWhatsAppInquiry}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors flex items-center justify-center gap-2 cursor-pointer mb-6"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Dúvidas? Pergunte direto pelo WhatsApp da loja</span>
                  </button>
                </div>

                {/* Description & Nutrition Tabs */}
                <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                      Descrição do Produto
                    </h4>
                    <p className="leading-relaxed">{product.description}</p>
                  </div>

                  {product.nutritionalInfo && (
                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100">
                      <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-amber-600" /> Níveis de Garantia & Composição
                      </h4>
                      <p className="text-amber-950/90 leading-relaxed font-medium">
                        {product.nutritionalInfo}
                      </p>
                    </div>
                  )}

                  {product.usageInstructions && (
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                        Modo de Usar / Indicação
                      </h4>
                      <p className="leading-relaxed">{product.usageInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
