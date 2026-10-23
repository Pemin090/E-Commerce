import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Truck,
  Search,
  Filter,
  Users,
  BarChart3,
  RefreshCw,
  Eye,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Product, Order, AdminStats, OrderStatus, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';

interface AdminPortalProps {
  onOpenProductDetail: (p: Product) => void;
  onOpenDbInspector: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onOpenProductDetail,
  onOpenDbInspector,
}) => {
  const { user, role, switchRole } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Product Create/Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Audio & Sound',
    brand: 'ApexAudio',
    price: '',
    originalPrice: '',
    stock: '',
    description: '',
    imageUrl: '',
    tags: '',
  });

  // Order Status Edit Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderStatusUpdate, setOrderStatusUpdate] = useState<OrderStatus>('processing');
  const [trackingCarrier, setTrackingCarrier] = useState('FedEx Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingNote, setTrackingNote] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, prodRes, ordersRes, catRes] = await Promise.all([
        api.getAdminStats(),
        api.getProducts(),
        api.getOrders(),
        api.getCategories(),
      ]);
      setStats(statsRes.stats);
      setProducts(prodRes.products || []);
      setOrders(ordersRes.orders || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      loadAdminData();
    }
  }, [role]);

  // Open modal to add product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.name || 'Audio & Sound',
      brand: 'ApexTech',
      price: '',
      originalPrice: '',
      stock: '20',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      tags: 'New, Pro',
    });
    setIsProductModalOpen(true);
  };

  // Open modal to edit product
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price.toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : '',
      stock: p.stock.toString(),
      description: p.description,
      imageUrl: p.images[0] || '',
      tags: p.tags?.join(', ') || '',
    });
    setIsProductModalOpen(true);
  };

  // Submit product create/edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock, 10) || 0,
        description: formData.description,
        images: [formData.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      setIsProductModalOpen(false);
      loadAdminData();
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action modifies the database permanently.`)) {
      try {
        await api.deleteProduct(id);
        loadAdminData();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  // Quick inline stock updater
  const handleQuickStockUpdate = async (p: Product, newStock: number) => {
    try {
      await api.updateProduct(p.id, { stock: Math.max(0, newStock) });
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: Math.max(0, newStock) } : item));
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  // Open order status modal
  const handleOpenOrderStatusModal = (order: Order) => {
    setEditingOrder(order);
    setOrderStatusUpdate(order.status);
    setTrackingCarrier(order.tracking.carrier || 'FedEx Express');
    setTrackingNumber(order.tracking.trackingNumber || `FX-${Math.floor(100000000 + Math.random() * 900000000)}US`);
    setTrackingNote(`Status updated to ${order.status} by admin.`);
  };

  // Save order status update
  const handleSaveOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      await api.updateOrderStatus(editingOrder.id, {
        status: orderStatusUpdate,
        carrier: trackingCarrier,
        trackingNumber: trackingNumber,
        note: trackingNote,
        location: 'Apex Distribution Hub',
      });
      setEditingOrder(null);
      await loadAdminData();
      refreshNotifications();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Role gate: if user is not admin
  if (role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Administrator Access Required</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          You are currently signed in as <strong>{user?.name}</strong> with the <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">customer</code> role.
          To access the product catalog management, inventory control, and order fulfillment APIs, switch to the administrator account.
        </p>
        <div className="pt-4">
          <button
            onClick={() => switchRole('admin')}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Switch to Admin Mode (Alex Rivera)</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    orderStatusFilter === 'all' ? true : o.status === orderStatusFilter
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & KPI Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2 border border-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>ApexStore Admin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              E-Commerce Management & Control
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Live database state, inventory controls, and order dispatch workflow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onOpenDbInspector}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-2"
            >
              <span>Inspect Database JSON</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-700 block mb-1">Total Revenue</span>
              <div className="text-2xl font-black text-indigo-950 font-mono">
                ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-indigo-500 mt-1 block">From verified paid orders</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 block mb-1">Total Orders</span>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {stats.totalOrders}
              </div>
              <span className="text-[11px] text-emerald-600 mt-1 block">Active & Fulfilled</span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
              <span className="text-xs font-semibold text-sky-700 block mb-1">Average Order Value</span>
              <div className="text-2xl font-black text-sky-950 font-mono">
                ${stats.averageOrderValue.toFixed(2)}
              </div>
              <span className="text-[11px] text-sky-600 mt-1 block">Per customer checkout</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
              <span className="text-xs font-semibold text-amber-700 block mb-1">Low Stock Alerts</span>
              <div className="text-2xl font-black text-amber-950 font-mono flex items-center gap-2">
                <span>{stats.lowStockCount}</span>
                {stats.lowStockCount > 0 && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              </div>
              <span className="text-[11px] text-amber-600 mt-1 block">Items with &le; 10 units</span>
            </div>
          </div>
        )}

        {/* Tabs: Product Management | Orders | Analytics */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog Management ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Order Fulfillment ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Sales & Category Breakdown</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          {/* Controls: Search & Add Product button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name or brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Inventory Stock</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="max-w-xs">
                          <span className="font-bold text-slate-900 block truncate" title={p.name}>
                            {p.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block">{p.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{p.category}</td>
                    <td className="py-3.5 px-4 font-black font-mono text-slate-900">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded ${
                            p.stock <= 5
                              ? 'bg-rose-100 text-rose-800'
                              : p.stock <= 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {p.stock}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickStockUpdate(p, p.stock - 1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                            title="Decrement stock"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(p, p.stock + 5)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                            title="Add 5 units"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">★ {p.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 block">({p.reviewsCount} reviews)</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenProductDetail(p)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Preview Product"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['all', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold uppercase transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Showing {filteredOrders.length} orders
            </span>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Carrier / Tracking</th>
                  <th className="py-3 px-4 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{o.customerName}</span>
                      <span className="text-[11px] text-slate-400 block">{o.customerEmail}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">{o.items.length} item(s)</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                      ${o.pricing.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          o.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'shipped'
                            ? 'bg-indigo-100 text-indigo-800'
                            : o.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {o.tracking.trackingNumber || 'Pending assignment'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenOrderStatusModal(o)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & CATEGORY STATS */}
      {activeTab === 'analytics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Sales Distribution by Category
            </h3>
            <div className="space-y-4 pt-2">
              {stats.salesByCategory.map((sc, i) => {
                const percentage = stats.totalRevenue > 0
                  ? Math.round((sc.revenue / stats.totalRevenue) * 100)
                  : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{sc.category}</span>
                      <span className="text-indigo-600 font-mono">${sc.revenue.toFixed(2)} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Role-Based Account Registry
            </h3>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-950 block">Alex Rivera</span>
                  <span className="text-amber-700 text-[11px]">admin@apexstore.com</span>
                </div>
                <span className="px-2.5 py-1 bg-amber-200 text-amber-900 font-extrabold rounded-lg uppercase text-[10px]">
                  Administrator
                </span>
              </div>

              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-950 block">Sophia Bennett</span>
                  <span className="text-indigo-700 text-[11px]">customer@apexstore.com</span>
                </div>
                <span className="px-2.5 py-1 bg-indigo-200 text-indigo-900 font-extrabold rounded-lg uppercase text-[10px]">
                  Customer
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex SonicPro ANC Wireless Headphones"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Count</label>
                  <input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. Best Seller, ANC, Fast Charge"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Status Update Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Order Status</h3>
                <span className="text-xs font-mono text-indigo-600">{editingOrder.orderNumber}</span>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fulfillment Status</label>
                <select
                  value={orderStatusUpdate}
                  onChange={(e) => setOrderStatusUpdate(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold"
                >
                  <option value="placed">Placed (Pending Processing)</option>
                  <option value="processing">Processing (Packing in Hub)</option>
                  <option value="shipped">Shipped (Handed to Carrier)</option>
                  <option value="delivered">Delivered (Completed)</option>
                  <option value="cancelled">Cancelled & Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Carrier Service</label>
                <input
                  type="text"
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Milestone Description / Note</label>
                <textarea
                  rows={2}
                  value={trackingNote}
                  onChange={(e) => setTrackingNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl text-[11px] text-indigo-700">
                Saving this will automatically emit an email notification to <strong>{editingOrder.customerEmail}</strong> with live tracking updates.
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Update & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
