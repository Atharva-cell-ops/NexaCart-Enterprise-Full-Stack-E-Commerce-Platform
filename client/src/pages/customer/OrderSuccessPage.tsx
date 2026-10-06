import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  MapPin,
  ArrowRight,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const stateOrder = (location.state as any)?.order;

  const { data: order = stateOrder, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: !!id && !stateOrder,
    initialData: stateOrder,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">
          We couldn't retrieve the details for this order number.
        </p>
        <Link to="/orders">
          <Button size="sm">View All Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          We've received your order and have notified our fulfillment center for immediate dispatch.
        </p>
      </div>

      {/* Order Info & Tracking Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Order Reference
            </span>
            <span className="text-lg font-mono font-extrabold text-indigo-600">
              {order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge status={order.status} />
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fulfillment Timeline Visual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <PackageCheck className="w-4 h-4" /> Order Confirmed
            </span>
            <span className="text-slate-400">Tracking: {order.trackingNumber || 'Pending'}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-2 bg-indigo-600 rounded-full" />
            <div className="h-2 bg-indigo-600 rounded-full" />
            <div className="h-2 bg-slate-200 rounded-full" />
            <div className="h-2 bg-slate-200 rounded-full" />
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-slate-800 block">Shipping Destination</span>
              <p className="text-slate-600">{order.shippingAddress.street}</p>
              <p className="text-slate-500">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            </div>
          </div>
        )}

        {/* Itemized Order Line Items */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Purchased Items
          </h4>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                    alt={item.productName}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.productName}</p>
                    <p className="text-[11px] text-slate-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900 shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt Totals Breakdown */}
        <div className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount Savings</span>
              <span>-${order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax (8%)</span>
            <span>${order.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
            <span>Total Paid</span>
            <span className="text-indigo-600">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/orders" className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full sm:w-auto">
            View Order History
          </Button>
        </Link>
        <Link to="/products" className="w-full sm:w-auto">
          <Button variant="outline" size="md" className="w-full sm:w-auto">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
