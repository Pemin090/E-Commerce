import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  Search,
  Check,
  RefreshCw,
  Zap,
  ShieldCheck,
  TrendingUp,
  Headphones,
  Laptop,
  Watch,
  Camera,
  Compass,
  ArrowUpDown,
  FilterX
} from 'lucide-react';
import { Product, Category } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';
import { api } from '../services/api.ts';

interface CatalogViewProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenDetail: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  'Audio & Sound': <Headphones className="w-4 h-4" />,
  'Laptops & Displays': <Laptop className="w-4 h-4" />,
  'Smart Wearables': <Watch className="w-4 h-4" />,
  'Cameras & Optics': <Camera className="w-4 h-4" />,
  'Workspace & Desk': <Compass className="w-4 h-4" />,
};

export const CatalogView: React.FC<CatalogViewProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenDetail,
  onEditProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch categories and products
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.getCategories(),
        api.getProducts({
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          inStock: inStockOnly || undefined,
          sort: sortBy,
        }),
      ]);
      setCategories(catRes.categories || []);
      setProducts(prodRes.products || []);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory, inStockOnly, sortBy]);

  // Client-side price filter if needed
  const filteredProducts = products.filter(p => {
    if (selectedPriceRange === 'under-200') return p.price < 200;
    if (selectedPriceRange === '200-500') return p.price >= 200 && p.price <= 500;
    if (selectedPriceRange === '500-1000') return p.price > 500 && p.price <= 1000;
    if (selectedPriceRange === 'over-1000') return p.price > 1000;
    return true;
  });

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setInStockOnly(false);
    setSortBy('popular');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedPriceRange !== 'all' ||
    inStockOnly ||
    searchQuery.trim().length > 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-4 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Studio Hardware</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Engineered for Creators, Innovators & Pros.
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Discover audio fidelity, ergonomic workspaces, and ultra-high performance computing designed to accelerate your craft.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Same-day Dispatch</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official 2-Year Warranty</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Live Order Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Navigation */}
      <section>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-102'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All Products</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                selectedCategory === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {products.length}
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-102'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {CATEGORY_ICON_MAP[cat.name] || <Sparkles className="w-4 h-4" />}
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  selectedCategory === cat.name ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cat.itemCount}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Controls Bar: Sort, Price Filter, Stock toggle */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Price Range Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold">Price:</span>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-semibold px-2.5 py-1.5 rounded-xl border-none outline-none cursor-pointer text-xs"
            >
              <option value="all">Any Price</option>
              <option value="under-200">Under $200</option>
              <option value="200-500">$200 - $500</option>
              <option value="500-1000">$500 - $1,000</option>
              <option value="over-1000">Over $1,000</option>
            </select>
          </div>

          {/* In stock only toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-xl transition-colors select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>

          {/* Active Filter Clear button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-semibold px-3 py-1.5 rounded-xl border-none outline-none cursor-pointer text-xs"
          >
            <option value="popular">Featured / Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Customer Rated</option>
            <option value="newest">New Arrivals</option>
          </select>
        </div>
      </section>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
              <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenDetail}
              onEditProduct={onEditProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No products matched your criteria</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Try adjusting your search terms, clearing category filters, or loosening price ranges.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
