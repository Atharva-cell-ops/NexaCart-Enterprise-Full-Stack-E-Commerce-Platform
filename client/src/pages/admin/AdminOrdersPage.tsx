import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  CheckCircle2,
  Truck,
  Eye,
  Edit2,
  MapPin,
  Clock,
  Filter,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Order, OrderStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('CONFIRMED');
  const [trackingInput, setTrackingInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', selectedStatus],
    queryFn: () =>
      adminApi.getAllOrders(1, 50, selectedStatus === 'ALL' ? undefined : selectedStatus),
  });

  const orders = data?.orders || [];

  const openStatusModal = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setTrackingInput(order.trackingNumber || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      setIsUpdating(true);
      await adminApi.updateOrderStatus(editingOrder.id, newStatus, trackingInput);
      success(`Order #${editingOrder.orderNumber} updated to ${newStatus}`);
      setEditingOrder(null);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    } catch (err: any) {
      toastError(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions: Array<OrderStatus | 'ALL'> = [
    'ALL',
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Order Operations Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review live customer transactions, adjust order fulfillment stages, and update courier tracking codes.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statusOptions.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedStatus === st
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px] bg-slate-900/40">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No orders found with status "{selectedStatus}".
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-semibold text-white">
                          {ord.user ? `${ord.user.firstName} ${ord.user.lastName}` : 'Guest Customer'}
                        </p>
                        <p className="text-[10px] text-slate-400">{ord.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-white">
                      ${ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-emerald-900/60">
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge status={ord.status} />
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Inspect Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(ord)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="Update Status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Inspection #${selectedOrder.orderNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-slate-900">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <Badge status={selectedOrder.status} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Tracking Number</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedOrder.trackingNumber || 'Pending Generation'}
                </span>
              </div>
            </div>

            {/* Customer & Shipping */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Customer Details</span>
                <p className="font-semibold text-slate-900">
                  {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                </p>
                <p className="text-slate-500">{selectedOrder.user?.email}</p>
                <p className="text-slate-500">{selectedOrder.user?.phoneNumber || 'No phone'}</p>
              </div>

              {selectedOrder.shippingAddress && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Shipping Destination</span>
                  <p className="text-slate-700">{selectedOrder.shippingAddress.street}</p>
                  <p className="text-slate-500">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              )}
            </div>

            {/* Itemized List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Order Items
              </h4>
              <div className="divide-y divide-slate-100">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-slate-400 text-[10px]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Status Modal */}
      {editingOrder && (
        <Modal
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          title={`Update Status for Order #${editingOrder.orderNumber}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-slate-900">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Order Lifecycle Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PENDING">PENDING (Awaiting confirmation)</option>
                <option value="CONFIRMED">CONFIRMED (Order verified)</option>
                <option value="PROCESSING">PROCESSING (Packing in warehouse)</option>
                <option value="SHIPPED">SHIPPED (Handed to courier)</option>
                <option value="DELIVERED">DELIVERED (Successfully delivered)</option>
                <option value="CANCELLED">CANCELLED (Order refunded/void)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Courier Tracking Code
              </label>
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="TRK-982314561"
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingOrder(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                Update Fulfillment Status
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
