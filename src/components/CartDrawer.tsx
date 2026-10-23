import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    couponCode,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const result = applyCoupon(inputCoupon);
    setCouponFeedback(result);
    if (result.success) {
      setInputCoupon('');
    }
  };

  const freeShippingThreshold = 100;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Shopping Cart</h2>
                <span className="text-xs text-slate-400">
                  {items.length} {items.length === 1 ? 'item' : 'unique items'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-indigo-50/70 p-3.5 border-b border-indigo-100 text-xs">
            <div className="flex items-center justify-between font-semibold text-indigo-950 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                {amountNeededForFreeShipping === 0 || appliedCoupon === 'FREESHIP'
                  ? 'Congratulations! You unlocked Free Shipping.'
                  : `Add $${amountNeededForFreeShipping.toFixed(2)} more for Free Shipping`}
              </span>
              <span className="text-indigo-600 font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-indigo-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: appliedCoupon === 'FREESHIP' ? '100%' : `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6 max-w-xs">
                  Browse our high-performance hardware catalog and add items to your cart.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{product.name}</h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-indigo-600 font-semibold">{product.brand}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 hover:bg-white text-slate-600 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {quantity}
                        </span>
                        <button
                          disabled={quantity >= product.stock}
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 hover:bg-white text-slate-600 rounded-r-lg disabled:opacity-40 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <span className="text-sm font-black text-slate-900">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
              {/* Promo Code Input */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon: SAVE10, APEX20..."
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-500 uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {couponFeedback && (
                  <div
                    className={`mt-1.5 text-[11px] font-semibold flex items-center gap-1 ${
                      couponFeedback.success ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {couponFeedback.success ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <span>{couponFeedback.message}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mt-2 flex items-center justify-between bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200">
                    <span>Active Promo: {appliedCoupon}</span>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900 text-[10px] underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Order Calculations */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-800">
                    {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-800">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-base text-indigo-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onOpenCheckout();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-center px-1">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Empty Cart
                  </button>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    🔒 SSL 256-bit Encrypted
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
