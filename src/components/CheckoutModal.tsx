import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  ArrowRight,
  PackageCheck,
  Mail,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';
import { Order, UserAddress } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { user } = useAuth();
  const { items, subtotal, discount, shipping, tax, total, couponCode, clearCart } = useCart();
  const { refreshNotifications, setIsInboxOpen } = useNotifications();

  // Shipping details state
  const defaultAddress = user?.addresses?.[0];
  const [fullName, setFullName] = useState(defaultAddress?.fullName || user?.name || 'Sophia Bennett');
  const [email, setEmail] = useState(user?.email || 'customer@apexstore.com');
  const [street, setStreet] = useState(defaultAddress?.street || '350 5th Avenue, Apt 18B');
  const [city, setCity] = useState(defaultAddress?.city || 'New York');
  const [state, setState] = useState(defaultAddress?.state || 'NY');
  const [zipCode, setZipCode] = useState(defaultAddress?.zipCode || '10118');
  const [phone, setPhone] = useState(defaultAddress?.phone || '+1 (555) 987-6543');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'apple_pay' | 'paypal'>('credit_card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState(fullName);

  // Flow & submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleFillDemoCard = () => {
    setCardNumber('4242 8492 9012 4242');
    setCardExpiry('10/28');
    setCardCvv('789');
    setCardHolder(fullName || 'Sophia Bennett');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    const shippingAddress: UserAddress = {
      id: `addr-${Date.now()}`,
      fullName,
      street,
      city,
      state,
      zipCode,
      country: 'United States',
      phone,
      isDefault: true,
    };

    const orderItems = items.map(i => ({
      productId: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      image: i.product.images[0],
    }));

    const pricing = {
      subtotal,
      discount,
      couponCode: couponCode || undefined,
      shipping,
      tax,
      total,
    };

    try {
      // Simulate real gateway handshake delay
      await new Promise(r => setTimeout(r, 900));

      const res = await api.createOrder({
        customerId: user?.id || 'user-customer-01',
        customerEmail: email,
        customerName: fullName,
        shippingAddress,
        items: orderItems,
        pricing,
        paymentMethod,
        cardLast4: paymentMethod === 'credit_card' ? cardNumber.slice(-4).replace(/\s/g, '') || '4242' : undefined,
        cardBrand: paymentMethod === 'credit_card' ? 'Visa' : undefined,
      });

      if (res.order) {
        setCompletedOrder(res.order);
        clearCart();
        refreshNotifications();

        // Confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
        });
      }
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {completedOrder ? 'Order Confirmation' : 'Secure Express Checkout'}
              </h2>
              <span className="text-xs text-slate-400">
                {completedOrder ? 'Receipt & Tracking details' : 'Encrypted with 256-bit TLS SSL'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed State */}
        {completedOrder ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <PackageCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Payment Authorized & Verified
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Thank You, {completedOrder.customerName}!
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Your order <strong className="text-indigo-600 font-mono">{completedOrder.orderNumber}</strong> has been successfully placed.
              </p>
            </div>

            {/* Order Card details */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
                <div>
                  <span className="text-slate-400 font-medium block">Order Number</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{completedOrder.orderNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-medium block">Total Paid</span>
                  <span className="font-black text-indigo-600 text-sm">${completedOrder.pricing.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-slate-400 font-medium block">Carrier & Tracking</span>
                  <span className="font-semibold text-slate-800">{completedOrder.tracking.carrier || 'Standard'}</span>
                  <span className="font-mono text-indigo-600 block">{completedOrder.tracking.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Estimated Delivery</span>
                  <span className="font-semibold text-slate-800">{completedOrder.tracking.estimatedDelivery || '3-5 Days'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  Confirmation sent to {completedOrder.customerEmail}
                </span>
                <button
                  onClick={() => setIsInboxOpen(true)}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  View Email
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOrderSuccess(completedOrder);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Track this Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handlePlaceOrder} className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Shipping Address */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  1. Shipping Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (for Receipt & Tracking)</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                    <input
                      required
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                      <input
                        required
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <input
                        required
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Zip Code</label>
                      <input
                        required
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Method & Gateway Simulation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    2. Payment Gateway
                  </h3>

                  <button
                    type="button"
                    onClick={handleFillDemoCard}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 transition-colors"
                  >
                    ⚡ Fill Demo Card
                  </button>
                </div>

                {/* Payment Method Switcher */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
                    }`}
                  >
                    <span className="text-sm font-bold block mb-0.5"> Pay</span>
                    <span className="text-[11px] block">Apple Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
                    }`}
                  >
                    <span className="text-sm font-bold text-sky-600 block mb-0.5">PayPal</span>
                    <span className="text-[11px] block">One-Touch</span>
                  </button>
                </div>

                {/* Card Fields */}
                {paymentMethod === 'credit_card' ? (
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number</label>
                      <input
                        required
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expires (MM/YY)</label>
                        <input
                          required
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Security Code (CVV)</label>
                        <input
                          required
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cardholder Name</label>
                      <input
                        required
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                    <p className="text-xs text-slate-600 font-medium">
                      Simulated {paymentMethod === 'apple_pay' ? 'Apple Pay Biometric Pass' : 'PayPal Express Authorization'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click 'Authorize & Place Order' below to execute the transaction test.
                    </p>
                  </div>
                )}

                {/* Order Summary Recap */}
                <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount ({couponCode})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-indigo-200">
                    <span>Total Amount</span>
                    <span className="text-indigo-600 font-mono text-base">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Submit CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Guaranteed safe checkout
              </span>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize & Place Order • ${total.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
