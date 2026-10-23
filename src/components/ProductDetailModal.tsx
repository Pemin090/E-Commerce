import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Share2,
  Tag
} from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  if (!product) return null;

  const { addToCart, items } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  const cartItem = items.find(i => i.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Gallery */}
          <div className="p-6 bg-slate-50 border-r border-slate-100 flex flex-col justify-between">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-xs border border-slate-200/80">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {discountPercent && (
                <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Save {discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-200/80 text-center">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <Truck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 block">Fast Shipping</span>
                <span className="text-[9px] text-slate-400 block">Tracked Delivery</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <RotateCcw className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 block">30-Day Return</span>
                <span className="text-[9px] text-slate-400 block">Zero Hassle</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 block">2-Yr Warranty</span>
                <span className="text-[9px] text-slate-400 block">Official Support</span>
              </div>
            </div>
          </div>

          {/* Right: Details & Order CTA */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Category, Brand & Share */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                    {product.brand}
                  </span>
                  <span>•</span>
                  <span>{product.category}</span>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Share product link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{copiedLink ? 'Copied!' : 'Share'}</span>
                </button>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200 fill-current'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount} customer reviews)</span>
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-black text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span
                  className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
                    isOutOfStock
                      ? 'bg-rose-100 text-rose-800'
                      : product.stock <= 8
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isOutOfStock ? 'Sold Out' : `In Stock: ${product.stock} units`}
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Specifications Table */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Specifications
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 divide-y divide-slate-200/60 text-xs">
                    {Object.entries(product.specs).map(([specKey, specVal]) => (
                      <div key={specKey} className="py-1.5 flex justify-between gap-4">
                        <span className="font-medium text-slate-500">{specKey}</span>
                        <span className="font-semibold text-slate-800 text-right">{specVal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Quantity & Add to Cart */}
            <div className="mt-8 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-40 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stock || isOutOfStock}
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-40 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add To Cart CTA */}
                <button
                  disabled={isOutOfStock}
                  onClick={() => {
                    addToCart(product, quantity);
                    setQuantity(1);
                  }}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : inCartQty > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 active:scale-98'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {isOutOfStock
                      ? 'Out of Stock'
                      : inCartQty > 0
                      ? `Add ${quantity} More (In Cart: ${inCartQty})`
                      : `Add to Cart • $${(product.price * quantity).toFixed(2)}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
