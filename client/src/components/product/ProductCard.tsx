import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { RatingStars } from '../common/RatingStars';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
}) => {
  const { addToCart } = useCart();

  const discountedPrice =
    product.discountPercent > 0
      ? Number((product.price * (1 - product.discountPercent / 100)).toFixed(2))
      : product.price;

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : [];

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  const mainImage = images[0] || FALLBACK_IMAGE;

  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 p-4 flex flex-col sm:flex-row gap-5 items-center">
        {/* Image */}
        <Link
          to={`/products/${product.slug}`}
          className="relative w-full sm:w-48 h-48 rounded-xl overflow-hidden bg-slate-100 shrink-0 block"
        >
          <img
            src={mainImage}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow">
              -{product.discountPercent}% OFF
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between w-full h-full">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[10px]">
                {product.category?.name || 'Accessories'}
              </span>
              <span>SKU: {product.sku}</span>
            </div>

            <Link to={`/products/${product.slug}`}>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <RatingStars rating={product.rating} showCount count={product.reviewCount} />
              <span className="text-xs text-slate-400">•</span>
              <span className={`text-xs font-semibold ${product.stock > 5 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900">
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Discount & Featured Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.discountPercent > 0 && (
          <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
            -{product.discountPercent}% OFF
          </span>
        )}
        {product.featured && (
          <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" /> FEATURED
          </span>
        )}
      </div>

      {/* Image Container with Hover Quick Actions */}
      <Link
        to={`/products/${product.slug}`}
        className="relative aspect-square w-full bg-slate-100 overflow-hidden block"
      >
        <img
          src={mainImage}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="w-10 h-10 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-lg hover:bg-indigo-600 hover:text-white transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200">
            <Eye className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
            <span className="text-indigo-600">{product.category?.name || 'Gear'}</span>
            <span className={product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}>
              {product.stock > 0 ? 'In Stock' : 'Sold Out'}
            </span>
          </div>

          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {product.description}
          </p>

          <div className="mt-2">
            <RatingStars rating={product.rating} showCount count={product.reviewCount} />
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 text-white transition-colors shadow-sm active:scale-95"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
