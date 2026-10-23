import React from 'react';
import { Star, ShoppingCart, Check, AlertCircle, Eye, Tag } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
  onEditProduct,
}) => {
  const { addToCart, items } = useCart();
  const { role } = useAuth();

  const cartItem = items.find(i => i.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 8;

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Section */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onOpenDetail(product)}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {discountPercent}% OFF
            </span>
          )}
          {product.featured && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              FEATURED
            </span>
          )}
        </div>

        {/* Stock status badge */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="bg-rose-100 text-rose-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-rose-200">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
              Only {product.stock} left!
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              In Stock
            </span>
          )}
        </div>

        {/* Hover Quick View Overlay button */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-slate-800 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* Body Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
            <span className="text-indigo-600 font-semibold">{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetail(product)}
            className="text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-1 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-800">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900">
              ${product.price.toFixed(2)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {role === 'admin' && onEditProduct && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProduct(product);
                }}
                className="p-2 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                title="Edit Product (Admin)"
              >
                Edit
              </button>
            )}

            <button
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : inCartQty > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
              }`}
            >
              {inCartQty > 0 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added ({inCartQty})</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
