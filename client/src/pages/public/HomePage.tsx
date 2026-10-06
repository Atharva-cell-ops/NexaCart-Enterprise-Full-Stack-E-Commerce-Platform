import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Truck,
  RotateCcw,
  Flame,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { ProductCard } from '../../components/product/ProductCard';
import { Button } from '../../components/common/Button';
import { ProductCardSkeleton } from '../../components/common/Skeleton';

export const HomePage: React.FC = () => {
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeatured(),
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 bg-gradient-to-b from-indigo-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next-Gen Audio & Desk Ecosystems</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Engineered for <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600">
                  Precision & Elegance.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover audiophile-grade wireless sound, precision mechanical keyboards, and minimalist workspace gear crafted to elevate your daily focus.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/products" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Explore Catalog
                  </Button>
                </Link>
                <Link to="/products?category=audio-acoustics" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Acoustics
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Authentic
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Global Returns
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 2-Year Warranty
                </span>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-3xl blur-2xl opacity-20 transform -rotate-1" />
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 overflow-hidden">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                      alt="Aether Pro Headphones"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> #1 Best Seller
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase">
                      <span>Audio & Acoustics</span>
                      <span className="text-emerald-600 font-bold">In Stock</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Aether Pro Spatial Wireless
                    </h3>
                    <p className="text-xs text-slate-500">
                      Lossless planar spatial acoustics with 40-hour hybrid noise cancellation.
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-slate-900">$297.49</span>
                        <span className="text-xs text-slate-400 line-through">$349.99</span>
                      </div>
                      <Link to="/products/aether-pro-spatial-wireless-headphones">
                        <Button size="sm" variant="dark">
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Curated Collections
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse products engineered for every aspect of your daily creative workflow.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isCategoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
              ))
            : categories?.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden bg-slate-900 p-4 flex flex-col justify-end aspect-[4/5] hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="relative z-10">
                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {cat.productCount ?? 0} products
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" /> Hand-Picked by Our Engineers
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Flagships
            </h2>
          </div>
          <Link to="/products" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isFeaturedLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts?.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* 4. HIGH-IMPACT PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-slate-800">
          <div className="relative z-10 max-w-xl space-y-6">
            <span className="bg-indigo-600/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Limited Promotional Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Upgrade Your Studio Workspace with 20% Off.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Use promo code <span className="text-amber-400 font-extrabold underline">NEXA20</span> at checkout on all orders exceeding $150. Includes free expedited 2-day domestic courier dispatch.
            </p>
            <div className="pt-2">
              <Link to="/products">
                <Button variant="primary" size="md">
                  Claim Discount Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRUST & ARCHITECTURE GUARANTEE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Express Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time shipment tracking with courier verification and doorstep delivery confirmation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Enterprise Security</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              End-to-end encrypted transactions and strict data privacy compliance standards.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Instant Full Refund</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              30-day money-back guarantee with prepaid return labels provided on all eligible gear.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
