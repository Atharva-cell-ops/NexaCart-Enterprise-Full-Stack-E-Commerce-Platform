import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { RatingStars } from '../../components/common/RatingStars';
import { Button } from '../../components/common/Button';
import { ReviewList } from '../../components/product/ReviewList';
import { ProductCard } from '../../components/product/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  const {
    data: product,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProductBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-10 bg-slate-200 rounded w-1/3" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested product could not be located in our catalog.
        </p>
        <Link to="/products">
          <Button size="sm">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : [];

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  const mainImage = images[selectedImageIndex] || FALLBACK_IMAGE;

  const discountedPrice =
    product.discountPercent > 0
      ? Number((product.price * (1 - product.discountPercent / 100)).toFixed(2))
      : product.price;

  const savings = Number((product.price - discountedPrice).toFixed(2));

  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Product link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-slate-700 transition-colors">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-slate-700 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner group">
            <img
              src={mainImage}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-lg">
                SAVE {product.discountPercent}%
              </span>
            )}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/90 backdrop-blur text-slate-600 hover:text-indigo-600 hover:bg-white shadow-md transition-all"
              title="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnail Carousel */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
              <span className="text-indigo-600">{product.category?.name || 'Accessories'}</span>
              <span className="text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating and Reviews Counter */}
            <div className="flex items-center gap-3 mt-3">
              <RatingStars rating={product.rating} showCount count={product.reviewCount} size="md" />
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Read verified reviews
              </button>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  ${discountedPrice.toFixed(2)}
                </span>
                {product.discountPercent > 0 && (
                  <span className="text-base text-slate-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-xs font-bold text-emerald-600">
                  You save ${savings.toFixed(2)} ({product.discountPercent}% off)
                </p>
              )}
            </div>

            {/* Stock Indicator */}
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  product.stock > 10
                    ? 'bg-emerald-100 text-emerald-800'
                    : product.stock > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {product.stock > 10
                  ? 'In Stock'
                  : product.stock > 0
                  ? `Only ${product.stock} Left`
                  : 'Out of Stock'}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quantity:
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                disabled={product.stock === 0}
                onClick={() => addToCart(product, quantity)}
                leftIcon={<ShoppingBag className="w-5 h-5" />}
              >
                Add to Cart
              </Button>
              <Button
                variant="dark"
                size="lg"
                disabled={product.stock === 0}
                onClick={handleBuyNow}
                leftIcon={<Zap className="w-5 h-5 text-amber-400" />}
              >
                Instant Buy Now
              </Button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Truck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">Fast Dispatch</span>
              <span className="text-[10px] text-slate-400">Within 24 Hours</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">2-Year Warranty</span>
              <span className="text-[10px] text-slate-400">Manufacturer Coverage</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <RotateCcw className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">30-Day Returns</span>
              <span className="text-[10px] text-slate-400">Risk-Free Trial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Technical Specs / Reviews */}
      <div className="pt-12 border-t border-slate-200">
        <div className="flex border-b border-slate-200 gap-8">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'description'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Detailed Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-extrabold">
              {product.reviewCount}
            </span>
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-4">
              <p>{product.description}</p>
              <p>
                Each NexaCart hardware edition is individually calibrated and inspected before packaging. Designed with precision acoustic damping, aircraft-grade CNC metals, and intuitive controls for professional workspaces.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-2xl">
              <table className="w-full text-xs text-left">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50 w-1/3">SKU Identifier</td>
                    <td className="py-3 px-4 text-slate-900">{product.sku}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50">Category</td>
                    <td className="py-3 px-4 text-slate-900">{product.category?.name || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50">In-Stock Quantity</td>
                    <td className="py-3 px-4 text-slate-900">{product.stock} units</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50">Warranty Policy</td>
                    <td className="py-3 px-4 text-slate-900">24-Month Manufacturer Guarantee</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewList
              productId={product.id}
              reviews={product.reviews || []}
              rating={product.rating}
              reviewCount={product.reviewCount}
              onReviewAdded={() => refetch()}
            />
          )}
        </div>
      </div>

      {/* Related Products Carousel / Grid */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Related Gear You May Like
            </h3>
            <Link to="/products" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((relProduct: any) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
