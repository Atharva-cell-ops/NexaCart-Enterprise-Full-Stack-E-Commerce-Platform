import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Search,
} from 'lucide-react';
import { productsApi, ProductFilters } from '../../api/products.api';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductFilterSidebar } from '../../components/product/ProductFilterSidebar';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Extract filters from URL query parameters
  const currentFilters: ProductFilters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    inStock: searchParams.get('inStock') === 'true',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12,
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updated = { ...currentFilters, ...newFilters };
    const params = new URLSearchParams();

    if (updated.search) params.set('search', updated.search);
    if (updated.category) params.set('category', updated.category);
    if (updated.minPrice !== undefined) params.set('minPrice', updated.minPrice.toString());
    if (updated.maxPrice !== undefined) params.set('maxPrice', updated.maxPrice.toString());
    if (updated.minRating !== undefined) params.set('minRating', updated.minRating.toString());
    if (updated.inStock) params.set('inStock', 'true');
    if (updated.sort && updated.sort !== 'newest') params.set('sort', updated.sort);
    if (updated.page && updated.page > 1) params.set('page', updated.page.toString());

    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Queries
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', currentFilters],
    queryFn: () => productsApi.getProducts(currentFilters),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  const products = productsData?.products || [];
  const meta = productsData?.meta;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {meta?.total !== undefined ? (
              <>Showing <span className="font-bold text-slate-800">{meta.total}</span> products</>
            ) : (
              'Discover our complete hardware and acoustic collections.'
            )}
            {currentFilters.search && (
              <> for query "<span className="text-indigo-600 font-semibold">{currentFilters.search}</span>"</>
            )}
          </p>
        </div>

        {/* View Toggle, Mobile Filter trigger, and Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold">Sort:</span>
            <select
              value={currentFilters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Grid / List Mode */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 sticky top-28">
          <ProductFilterSidebar
            categories={categories}
            filters={currentFilters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          {isProductsLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No Products Found"
              description="We couldn't find any products matching your current filters or search term. Try adjusting your query or resetting filters."
              actionText="Clear All Filters"
              onAction={resetFilters}
            />
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>

              {/* Pagination Controls */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                  <p className="text-xs text-slate-500">
                    Page <span className="font-bold text-slate-800">{meta.page}</span> of{' '}
                    <span className="font-bold text-slate-800">{meta.totalPages}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page <= 1}
                      onClick={() => updateFilters({ page: meta.page - 1 })}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: meta.totalPages }).map((_, idx) => {
                        const p = idx + 1;
                        return (
                          <button
                            key={p}
                            onClick={() => updateFilters({ page: p })}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                              meta.page === p
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => updateFilters({ page: meta.page + 1 })}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Filters</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProductFilterSidebar
                categories={categories}
                filters={currentFilters}
                onFilterChange={(f) => {
                  updateFilters(f);
                }}
                onReset={resetFilters}
              />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
