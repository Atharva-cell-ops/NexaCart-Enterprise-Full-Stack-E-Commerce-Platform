import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const items = cart?.items || [];
  const summary = cart?.summary;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    setCouponInput('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Explore our high-performance headphones, minimalist desk gear, and creator peripherals to find something you love."
          actionText="Explore All Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart ({cart?.itemCount || 0} items)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected gear before proceeding to secure checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors self-start sm:self-auto"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Free Shipping Alert */}
          {summary && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-800">
                <span>
                  {summary.amountNeededForFreeShipping > 0 ? (
                    <>
                      Add <span className="font-bold text-indigo-600">${summary.amountNeededForFreeShipping.toFixed(2)}</span> more to qualify for <span className="font-bold text-emerald-600">FREE Standard Delivery</span>
                    </>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> You have unlocked FREE Express Delivery!
                    </span>
                  )}
                </span>
                <span className="text-slate-500 font-bold">
                  ${summary.subtotal.toFixed(0)} / ${summary.freeShippingThreshold}
                </span>
              </div>
              <div className="w-full bg-indigo-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (summary.subtotal / summary.freeShippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => {
              const img =
                item.product.images[0] ||
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center shadow-sm"
                >
                  <img
                    src={img}
                    alt={item.product.name}
                    className="w-24 h-24 rounded-xl object-cover bg-slate-100 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between w-full space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                          {item.product.category?.name || 'Hardware'}
                        </span>
                        <Link to={`/products/${item.product.slug}`}>
                          <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Unit Price: ${item.product.discountedPrice.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-slate-900">
                          ${item.lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline pt-2"
          >
            ← Continue Shopping More Gear
          </Link>
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-28">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          {/* Promo Coupon Form */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Promo Code</label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>{appliedCoupon.code} (-${appliedCoupon.discountAmount.toFixed(2)})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-emerald-700 hover:text-emerald-900 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10, NEXA20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <Button type="submit" size="sm" variant="outline" isLoading={isApplyingCoupon}>
                  Apply
                </Button>
              </form>
            )}
            <p className="text-[10px] text-slate-400">
              Try testing coupon codes <span className="font-bold text-indigo-600">WELCOME10</span> (10% off) or <span className="font-bold text-indigo-600">NEXA20</span> (20% off).
            </p>
          </div>

          {/* Summary Breakdown */}
          {summary && (
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${summary.subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span>${summary.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>{summary.shippingFee === 0 ? 'FREE' : `$${summary.shippingFee.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Estimated Total</span>
                <span className="text-indigo-600">${summary.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            onClick={() => navigate('/checkout')}
            variant="primary"
            size="lg"
            className="w-full justify-between"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Proceed to Checkout
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted checkout powered by NexaCart Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};
