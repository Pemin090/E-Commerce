import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Check,
  Copy,
  ExternalLink,
  Mail,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';

interface OrderTrackingViewProps {
  initialOrder?: Order | null;
}

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'placed', label: 'Order Placed', desc: 'Authorized' },
  { status: 'processing', label: 'Processing', desc: 'Packing in Hub' },
  { status: 'shipped', label: 'In Transit', desc: 'With Carrier' },
  { status: 'delivered', label: 'Delivered', desc: 'Signed & Received' },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ initialOrder }) => {
  const { user } = useAuth();
  const { setIsInboxOpen } = useNotifications();

  const [lookupQuery, setLookupQuery] = useState(initialOrder?.orderNumber || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder || null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Load user's recent orders
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const res = await api.getOrders({
          customerId: user?.role === 'admin' ? undefined : user?.id,
        });
        if (res.orders) {
          setUserOrders(res.orders);
          if (!currentOrder && res.orders.length > 0) {
            setCurrentOrder(res.orders[0]);
            setLookupQuery(res.orders[0].orderNumber);
          }
        }
      } catch (e) {
        console.error('Failed to load user orders:', e);
      }
    };
    fetchUserOrders();
  }, [user]);

  // When initialOrder changes from props
  useEffect(() => {
    if (initialOrder) {
      setCurrentOrder(initialOrder);
      setLookupQuery(initialOrder.orderNumber);
    }
  }, [initialOrder]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupQuery.trim();
    if (!query) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.getOrder(query);
      if (res.order) {
        setCurrentOrder(res.order);
      } else {
        setError(`No order found for ID "${query}". Please check your order number.`);
        setCurrentOrder(null);
      }
    } catch (err: any) {
      setError(`No order found for ID "${query}". Check the order number or choose from your recent orders below.`);
      setCurrentOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTracking = (trackNum: string) => {
    navigator.clipboard?.writeText(trackNum);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const getStepState = (stepStatus: OrderStatus) => {
    if (!currentOrder) return 'upcoming';
    if (currentOrder.status === 'cancelled') return 'cancelled';

    const orderIndex = STATUS_STEPS.findIndex(s => s.status === currentOrder.status);
    const stepIndex = STATUS_STEPS.findIndex(s => s.status === stepStatus);

    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header & Lookup Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200">
            <Truck className="w-3.5 h-3.5" />
            <span>Real-time Logistics & Fulfillment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Tracking & Live Status
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track packages with live milestones, carrier verification, and delivery estimates.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Order ID (e.g. ORD-98421 or ORD-97510)"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !lookupQuery.trim()}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Track Order</span>
          </button>
        </form>

        {/* Quick Recent Order Chips */}
        {userOrders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Your Recent Orders:</span>
            {userOrders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => {
                  setCurrentOrder(ord);
                  setLookupQuery(ord.orderNumber);
                  setError(null);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-colors flex items-center gap-1.5 ${
                  currentOrder?.id === ord.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{ord.orderNumber}</span>
                <span className="text-[10px] uppercase font-bold opacity-80">({ord.status})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Order Details Card */}
      {currentOrder && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                  {currentOrder.orderNumber}
                </span>
                <span
                  className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full ${
                    currentOrder.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : currentOrder.status === 'shipped'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      : currentOrder.status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {currentOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Carrier info pill */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center border border-slate-200 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="text-slate-400 font-medium block">Carrier: {currentOrder.tracking.carrier || 'Apex Logistics'}</span>
                {currentOrder.tracking.trackingNumber ? (
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                    <span>{currentOrder.tracking.trackingNumber}</span>
                    <button
                      onClick={() => handleCopyTracking(currentOrder.tracking.trackingNumber!)}
                      className="text-indigo-600 hover:text-indigo-800 p-0.5"
                      title="Copy tracking number"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500">Generating tracking...</span>
                )}
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Milestone Progress
            </h3>

            <div className="grid grid-cols-4 relative">
              {/* Line connector behind pills */}
              <div className="absolute top-5 left-[12%] right-[12%] h-1 bg-slate-200 -z-0">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width:
                      currentOrder.status === 'delivered'
                        ? '100%'
                        : currentOrder.status === 'shipped'
                        ? '66%'
                        : currentOrder.status === 'processing'
                        ? '33%'
                        : '5%',
                  }}
                ></div>
              </div>

              {STATUS_STEPS.map((step, idx) => {
                const state = getStepState(step.status);
                return (
                  <div key={step.status} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        state === 'completed'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : state === 'current'
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md animate-pulse'
                          : 'bg-white text-slate-400 border-2 border-slate-300'
                      }`}
                    >
                      {state === 'completed' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800 mt-2 block">{step.label}</span>
                    <span className="text-[10px] text-slate-400 block hidden sm:block">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid: Tracking History Timeline vs Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
            {/* Left: Events Timeline */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Tracking Timeline & Notes
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {currentOrder.tracking.events.map((ev, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{ev.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{ev.description}</p>
                      {ev.location && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Email Receipt preview button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsInboxOpen(true)}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>View automated email sent to {currentOrder.customerEmail}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Right: Order Items & Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-indigo-600" />
                Items & Payment Breakdown
              </h3>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 divide-y divide-slate-200/70">
                {currentOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{it.name}</p>
                      <span className="text-[11px] text-slate-500">
                        Qty: {it.quantity} × ${it.price.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      ${(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Box */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${currentOrder.pricing.subtotal.toFixed(2)}</span>
                </div>
                {currentOrder.pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({currentOrder.pricing.couponCode || 'Promo'})</span>
                    <span>-${currentOrder.pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {currentOrder.pricing.shipping === 0 ? 'FREE' : `$${currentOrder.pricing.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span className="font-semibold">${currentOrder.pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Paid</span>
                  <span className="text-indigo-600 font-mono text-base">${currentOrder.pricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Address & Payment summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Delivery Address:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {currentOrder.shippingAddress.fullName}<br />
                    {currentOrder.shippingAddress.street}, {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/80">
                  <span className="text-slate-400 font-medium">Payment Method:</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {currentOrder.payment.method.replace('_', ' ')}
                    {currentOrder.payment.cardLast4 ? ` (•••• ${currentOrder.payment.cardLast4})` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
