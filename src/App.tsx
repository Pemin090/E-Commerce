/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { CatalogView } from './components/CatalogView.tsx';
import { OrderTrackingView } from './components/OrderTrackingView.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { EmailInboxDrawer } from './components/EmailInboxDrawer.tsx';
import { DatabaseInspectorModal } from './components/DatabaseInspectorModal.tsx';
import { Product, Order } from './types/index.ts';
import { ShieldCheck, Database, Layers, Sparkles } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'tracking' | 'admin' | 'db'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setTrackedOrder(order);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab === 'db' ? 'catalog' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'db') {
            setIsDbInspectorOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenDbInspector={() => setIsDbInspectorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'catalog' && (
          <CatalogView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenDetail={(prod) => setSelectedProduct(prod)}
            onEditProduct={(prod) => {
              setActiveTab('admin');
            }}
          />
        )}

        {activeTab === 'tracking' && (
          <OrderTrackingView initialOrder={trackedOrder} />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            onOpenProductDetail={(prod) => setSelectedProduct(prod)}
            onOpenDbInspector={() => setIsDbInspectorOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5 font-['Space_Grotesk']">
                ApexStore
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-400/30">
                  PRO
                </span>
              </span>
              <p className="text-slate-400 leading-relaxed text-xs">
                A full-stack e-commerce web application featuring product management, shopping cart, payment gateway simulation, order tracking, and role-based access control.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Key Features</h4>
              <ul className="space-y-1.5 text-xs">
                <li>• RESTful Backend APIs</li>
                <li>• Persistent Document Database</li>
                <li>• Role-Based Access Control (Admin/User)</li>
                <li>• Real-Time Order Milestone Tracking</li>
                <li>• Automated Email Receipts Simulator</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => setActiveTab('catalog')} className="hover:text-white transition-colors">
                    Product Catalog & Search
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('tracking')} className="hover:text-white transition-colors">
                    Live Order Tracker
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('admin')} className="hover:text-white transition-colors">
                    Admin Inventory & Fulfillment
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsDbInspectorOpen(true)} className="hover:text-white transition-colors">
                    Database Engine Explorer
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">System Architecture</h4>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Backend:</span>
                  <span className="text-emerald-400 font-bold">Express REST API</span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="text-indigo-400 font-bold">Persistent JSON Store</span>
                </div>
                <div className="flex justify-between">
                  <span>Auth:</span>
                  <span className="text-amber-400 font-bold">RBAC (Admin / User)</span>
                </div>
                <div className="flex justify-between">
                  <span>Frontend:</span>
                  <span className="text-sky-400 font-bold">React 19 + Tailwind CSS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} ApexStore Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Backend & APIs Online
              </span>
              <span>•</span>
              <button
                onClick={() => setIsDbInspectorOpen(true)}
                className="hover:text-white underline"
              >
                Inspect DB Collections
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer onOpenCheckout={handleOpenCheckout} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <EmailInboxDrawer />

      <DatabaseInspectorModal
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
