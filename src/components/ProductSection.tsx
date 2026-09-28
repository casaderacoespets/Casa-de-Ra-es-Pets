import React from 'react';
import { ArrowRight, Flame, Sparkles, Award } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useStore } from '../context/StoreContext';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  icon?: 'flame' | 'sparkles' | 'award';
  products: Product[];
  viewAllAction?: () => void;
  id?: string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  icon,
  products,
  viewAllAction,
  id,
}) => {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10" id={id}>
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            {icon === 'flame' && <Flame className="w-6 h-6 text-rose-500 fill-rose-500" />}
            {icon === 'sparkles' && <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />}
            {icon === 'award' && <Award className="w-6 h-6 text-amber-600" />}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllAction && (
          <button
            type="button"
            onClick={viewAllAction}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 hover:underline transition-all cursor-pointer shrink-0"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
