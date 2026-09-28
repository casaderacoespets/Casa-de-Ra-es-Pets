import React, { useState } from 'react';
import { Plus, Minus, Star, ShoppingBag, Eye, Sparkles, ZoomIn } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getEffectiveProductPricing } from '../utils/pricing';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    updateCartQuantity,
    getCartItemQuantity,
    setSelectedProductForModal,
    setZoomedImage,
  } = useStore();

  const [selectedVariationId, setSelectedVariationId] = useState<string | undefined>(undefined);

  // Centralized pricing logic
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

  const currentCartQty = getCartItemQuantity(product.id, effectiveVariationId);

  // Diagnostic logs
  console.log('[TRACE PUBLIC PRODUCT]', {
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
  });

  console.log('[PUBLIC PRODUCT RENDER]', {
    productId: product.id,
    name: product.name,
    price: currentPrice,
    originalPrice: currentOriginalPrice,
    variations: product.variations,
  });

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, effectiveVariationId, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartQuantity(product.id, effectiveVariationId, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartQuantity(product.id, effectiveVariationId, -1);
  };

  return (
    <div
      onClick={() => setSelectedProductForModal(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer p-3 sm:p-4"
      id={`product-card-${product.id}`}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1">
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-amber-900" /> Mais Vendido
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProductForModal(product);
          }}
          className="pointer-events-auto opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md transition-all hover:scale-110"
          title="Ver detalhes do produto"
          aria-label="Ver detalhes"
        >
          <Eye className="w-4 h-4 text-[#0B2B6D]" />
        </button>
      </div>

      {/* Product Image */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (product.image) {
            setZoomedImage({
              src: product.image,
              alt: product.name,
              title: product.name,
            });
          }
        }}
        className="group/img relative w-full pt-[85%] rounded-xl overflow-hidden bg-slate-50 mb-3 flex items-center justify-center cursor-zoom-in"
        title="Clique para ampliar a foto"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
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
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Subtle Zoom Hint on Hover */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-black/60 text-white p-2 rounded-full backdrop-blur-xs shadow-md transform scale-90 group-hover/img:scale-100 transition-transform">
            <ZoomIn className="w-4 h-4" />
          </span>
        </div>
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-amber-600 uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1 text-slate-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-[11px]">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-[#0B2B6D] transition-colors">
            {product.name}
          </h3>

          {/* Unit / Weight options if available */}
          {product.variations && product.variations.length > 0 ? (
            <div
              className="flex items-center gap-1.5 flex-wrap my-2"
              onClick={(e) => e.stopPropagation()}
            >
              {product.variations.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariationId(v.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                    effectiveVariationId === v.id
                      ? 'bg-[#0B2B6D] text-white border-[#0B2B6D]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          ) : product.unit ? (
            <div className="text-[11px] font-medium text-slate-500 mb-2">
              Embalagem: <span className="text-slate-700 font-semibold">{product.unit}</span>
            </div>
          ) : null}
        </div>

        {/* Pricing Block */}
        <div className="pt-2 mt-auto border-t border-slate-100">
          {currentOriginalPrice && currentOriginalPrice > currentPrice && (
            <span className="block text-[11px] text-slate-400 line-through">
              {currentOriginalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )}

          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
              {currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
            {pixPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no PIX (5% OFF)
          </p>

          {/* Add to Cart or Qty Stepper */}
          <div className="mt-3">
            {currentCartQty > 0 ? (
              <div
                className="flex items-center justify-between bg-amber-400 text-slate-950 font-bold rounded-xl p-1 shadow-sm"
                onClick={(e) => e.stopPropagation()}
                id={`cart-stepper-${product.id}`}
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="text-sm font-extrabold px-2">{currentCartQty}</span>

                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-black active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border border-slate-800 hover:border-[#D4AF37]/60 cursor-pointer"
                id={`add-btn-${product.id}`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Adicionar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
