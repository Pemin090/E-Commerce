import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Code,
  Terminal,
  FileJson,
  Layers
} from 'lucide-react';
import { api } from '../services/api.ts';

interface DatabaseInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatabaseReset?: () => void;
}

export const DatabaseInspectorModal: React.FC<DatabaseInspectorModalProps> = ({
  isOpen,
  onClose,
  onDatabaseReset,
}) => {
  const [activeCollection, setActiveCollection] = useState<'products' | 'orders' | 'users' | 'categories' | 'notifications' | 'apis'>('products');
  const [dbData, setDbData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchDatabase = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRawDb();
      setDbData(res.data);
    } catch (err) {
      console.error('Failed to export DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDatabase();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!dbData) return;
    const content = activeCollection === 'apis'
      ? JSON.stringify(dbData, null, 2)
      : JSON.stringify(dbData[activeCollection] || [], null, 2);
    navigator.clipboard?.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset the database to original initial records? All custom products and new orders will be restored to default.')) {
      setResetting(true);
      try {
        await api.resetDatabase();
        await fetchDatabase();
        if (onDatabaseReset) onDatabaseReset();
      } catch (err) {
        console.error('Failed to reset DB:', err);
      } finally {
        setResetting(false);
      }
    }
  };

  const API_ENDPOINTS = [
    { method: 'GET', path: '/api/products', desc: 'Query catalog with ?search, ?category, ?minPrice, ?inStock, ?sort' },
    { method: 'GET', path: '/api/products/:id', desc: 'Fetch single product specifications and images' },
    { method: 'POST', path: '/api/products', desc: '[Admin] Insert new product into catalog' },
    { method: 'PUT', path: '/api/products/:id', desc: '[Admin] Update product stock, price or details' },
    { method: 'DELETE', path: '/api/products/:id', desc: '[Admin] Delete product from store' },
    { method: 'GET', path: '/api/categories', desc: 'List all categories with live item counts' },
    { method: 'GET', path: '/api/orders', desc: 'List customer orders (filtered by customerId or status)' },
    { method: 'GET', path: '/api/orders/:id', desc: 'Get order details & tracking event history' },
    { method: 'POST', path: '/api/orders', desc: 'Create order, deduct stock, trigger email notification' },
    { method: 'PATCH', path: '/api/orders/:id/status', desc: '[Admin] Progress order status & append tracking milestone' },
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticate as Customer or Administrator' },
    { method: 'GET', path: '/api/admin/stats', desc: 'Retrieve aggregated sales KPIs, revenue & AOV' },
    { method: 'GET', path: '/api/notifications', desc: 'Retrieve transactional email receipts' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Database Engine & API Explorer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  data/ecommerce-db.json
                </span>
              </h2>
              <span className="text-xs text-slate-400">
                Persistent JSON Document Store with Full CRUD & RESTful Endpoints
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900 text-xs font-semibold border border-rose-800/50 flex items-center gap-1.5 transition-colors"
              title="Reset DB to initial seed"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>Reset DB Seed</span>
            </button>

            <button
              onClick={fetchDatabase}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh collections"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collection Selector Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs">
          {[
            { id: 'products', label: 'Products', count: dbData?.products?.length },
            { id: 'orders', label: 'Orders', count: dbData?.orders?.length },
            { id: 'users', label: 'Users', count: dbData?.users?.length },
            { id: 'categories', label: 'Categories', count: dbData?.categories?.length },
            { id: 'notifications', label: 'Emails', count: dbData?.notifications?.length },
            { id: 'apis', label: 'REST API Documentation', isDoc: true },
          ].map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveCollection(col.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeCollection === col.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span>{col.label}</span>
              {col.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {col.count}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={handleCopy}
            className="ml-auto px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-300">
          {activeCollection === 'apis' ? (
            <div className="space-y-3 font-sans">
              <h3 className="text-white text-sm font-bold font-mono">Backend REST API Reference</h3>
              <div className="grid gap-2">
                {API_ENDPOINTS.map((ep, i) => (
                  <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase shrink-0 ${
                        ep.method === 'GET'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : ep.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : ep.method === 'PUT' || ep.method === 'PATCH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <div>
                      <div className="font-mono text-white text-xs font-bold">{ep.path}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{ep.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap leading-relaxed text-indigo-200">
              {JSON.stringify(dbData ? dbData[activeCollection] : {}, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
