import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminApi.getMetrics(),
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;
  const recentOrders = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const statusCounts = data?.statusCounts || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time revenue, order fulfillment, and inventory metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/products">
            <Button size="sm" variant="primary">
              Manage Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              ${metrics?.totalRevenue.toLocaleString() || '0.00'}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.8% from last month
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Orders Processed
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics?.totalOrders || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">All time orders</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Catalog
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-800/60 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics?.totalProducts || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">SKUs listed</span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registered Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/60 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics?.totalUsers || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Customer accounts</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Recent Customer Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-2">Order #</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-indigo-400">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-2">
                        {ord.user ? `${ord.user.firstName} ${ord.user.lastName}` : 'Guest Customer'}
                      </td>
                      <td className="py-3 px-2 font-bold text-white">
                        ${ord.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <Badge status={ord.status} />
                      </td>
                      <td className="py-3 px-2 text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Low Stock Alerts & Status Distribution */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Warning Card */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Low Stock Alerts</span>
              </div>
              <span className="text-xs bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold px-2 py-0.5 rounded-full">
                {lowStockProducts.length} items
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                All inventory levels are healthy!
              </p>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.sku}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 text-xs font-extrabold shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Distribution */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Order Status Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st) => (
                <div key={st} className="flex justify-between items-center py-1">
                  <span className="text-slate-300">{st}</span>
                  <span className="font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {statusCounts[st] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
