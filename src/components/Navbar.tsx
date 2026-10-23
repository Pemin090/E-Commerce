import React, { useState } from 'react';
import {
  ShoppingBag,
  Package,
  ShieldCheck,
  Mail,
  Search,
  Database,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';

interface NavbarProps {
  activeTab: 'catalog' | 'tracking' | 'admin' | 'db';
  setActiveTab: (tab: 'catalog' | 'tracking' | 'admin' | 'db') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenDbInspector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenDbInspector,
}) => {
  const { user, role, switchRole } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { unreadCount, setIsInboxOpen } = useNotifications();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRoleToggle = async () => {
    const nextRole = role === 'admin' ? 'customer' : 'admin';
    await switchRole(nextRole);
    setIsRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Backend Active
            </span>
            <span className="hidden sm:inline text-slate-400">
              RESTful APIs • Persistent Document Database • Real-time Order Tracking
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 hidden md:inline">Use code <strong className="text-amber-400 font-mono">SAVE10</strong> for 10% off</span>
            <button
              onClick={handleRoleToggle}
              className="flex items-center gap-1.5 text-indigo-300 hover:text-white transition-colors bg-indigo-950/80 hover:bg-indigo-900 px-2.5 py-0.5 rounded border border-indigo-700/50"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Switch to {role === 'admin' ? 'Customer Mode' : 'Admin Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5 font-['Space_Grotesk']">
                  ApexStore
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-200">
                    PRO
                  </span>
                </span>
                <span className="block text-[11px] text-slate-500 font-medium -mt-0.5">
                  Full-Stack E-Commerce
                </span>
              </div>
            </button>
          </div>

          {/* Search bar (Center) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, brands, audio, laptops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 rounded-full border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-slate-100 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Shop Catalog
            </button>

            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'tracking'
                  ? 'bg-slate-100 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Track Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Admin Portal</span>
              {role === 'admin' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={onOpenDbInspector}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 border border-dashed border-slate-300"
              title="Inspect JSON Database & REST Collections"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs">Database</span>
            </button>
          </nav>

          {/* Action icons right */}
          <div className="flex items-center gap-2">
            {/* Email Notifications inbox */}
            <button
              onClick={() => setIsInboxOpen(true)}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Simulated Email Inbox"
            >
              <Mail className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Shopping Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Cart</span>
              <span className="bg-indigo-800 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {itemCount}
              </span>
            </button>

            {/* User profile dropdown & Role badge */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user?.name?.slice(0, 2).toUpperCase() || 'US'}
                  </div>
                )}
                <div className="hidden xl:block text-left pr-1">
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                    {user?.name?.split(' ')[0]}
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                        role === 'admin'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Dropdown */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      <span>Active Role:</span>
                      <strong className={role === 'admin' ? 'text-amber-600' : 'text-indigo-600'}>
                        {role === 'admin' ? 'Administrator' : 'Customer'}
                      </strong>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <p className="px-2 pt-1 text-[11px] font-semibold text-slate-400 uppercase">Role-Based Access Control</p>
                    <button
                      onClick={async () => {
                        await switchRole('admin');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-medium transition-colors ${
                        role === 'admin' ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <div>
                          <div className="font-bold">Admin (Alex Rivera)</div>
                          <div className="text-[10px] text-slate-400">Manage products, orders & inventory</div>
                        </div>
                      </div>
                      {role === 'admin' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                    </button>

                    <button
                      onClick={async () => {
                        await switchRole('customer');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-medium transition-colors ${
                        role === 'customer' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div className="font-bold">Customer (Sophia Bennett)</div>
                          <div className="text-[10px] text-slate-400">Shop, cart, checkout & track packages</div>
                        </div>
                      </div>
                      {role === 'customer' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 p-2">
                    <button
                      onClick={() => {
                        setActiveTab('tracking');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                      <Package className="w-3.5 h-3.5" />
                      View My Orders
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-2">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-100 text-slate-900 rounded-lg"
              />
            </div>
            <button
              onClick={() => { setActiveTab('catalog'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Shop Catalog
            </button>
            <button
              onClick={() => { setActiveTab('tracking'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <Package className="w-4 h-4" /> Track Orders
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Admin Portal
            </button>
            <button
              onClick={() => { onOpenDbInspector(); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-2"
            >
              <Database className="w-4 h-4" /> Database Inspector
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
