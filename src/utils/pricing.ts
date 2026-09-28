import { Product, ProductVariation } from '../types';

export interface EffectivePricing {
  effectivePrice: number;
  effectiveOriginalPrice?: number;
  selectedVariation?: ProductVariation;
  hasVariations: boolean;
  effectiveVariationId?: string;
  discountPercent: number;
  pixPrice: number; // 5% discount: effectivePrice * 0.95
}

/**
 * Centralized function to calculate the effective price of a product,
 * whether it has variations or uses a single base price.
 */
export function getEffectiveProductPricing(
  product: Product,
  variationId?: string
): EffectivePricing {
  const hasVariations = Array.isArray(product.variations) && product.variations.length > 0;
  
  let selectedVariation: ProductVariation | undefined = undefined;
  let effectiveVariationId: string | undefined = undefined;

  if (hasVariations) {
    if (variationId) {
      selectedVariation = product.variations!.find((v) => v.id === variationId);
    }
    // Default to first variation if specified variationId not found or not passed
    if (!selectedVariation) {
      selectedVariation = product.variations![0];
    }
    effectiveVariationId = selectedVariation?.id;
  }

  let effectivePrice = Number(product.price) || 0;
  let effectiveOriginalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;

  if (selectedVariation) {
    effectivePrice = Number(selectedVariation.price) || 0;
    effectiveOriginalPrice = selectedVariation.originalPrice ? Number(selectedVariation.originalPrice) : undefined;
  }

  const discountPercent =
    effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice
      ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
      : product.isPromo
      ? 12
      : 0;

  // Exact PIX calculation: 5% discount
  const pixPrice = effectivePrice * 0.95;

  console.log('[TRACE VARIATION PRICE]', {
    id: product.id,
    name: product.name,
    requestedVariationId: variationId,
    effectiveVariationId,
    selectedVariationName: selectedVariation?.name,
    basePrice: product.price,
    baseOriginalPrice: product.originalPrice,
    effectivePrice,
    effectiveOriginalPrice,
    pixPrice,
  });

  return {
    effectivePrice,
    effectiveOriginalPrice,
    selectedVariation,
    hasVariations,
    effectiveVariationId,
    discountPercent,
    pixPrice,
  };
}
