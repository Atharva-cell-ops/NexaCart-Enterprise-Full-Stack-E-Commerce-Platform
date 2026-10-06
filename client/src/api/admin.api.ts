import { apiClient } from './client';
import { ApiResponse, Order, Product, User } from '../types';

export interface AdminMetrics {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    lowStockCount: number;
  };
  lowStockProducts: Array<{ id: string; name: string; stock: number; sku: string }>;
  recentOrders: Order[];
  statusCounts: Record<string, number>;
}

export const adminApi = {
  async getMetrics(): Promise<AdminMetrics> {
    const res = await apiClient.get<ApiResponse<AdminMetrics>>('/admin/metrics');
    return res.data.data;
  },

  async createProduct(data: any): Promise<Product> {
    const res = await apiClient.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },

  async updateProduct(id: string, data: any): Promise<Product> {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async getAllOrders(page: number = 1, limit: number = 15, status?: string): Promise<{ orders: Order[]; meta: any }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const res = await apiClient.get<ApiResponse<Order[]>>(`/admin/orders?${params.toString()}`);
    return {
      orders: res.data.data,
      meta: res.data.meta,
    };
  },

  async updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<Order> {
    const res = await apiClient.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, {
      status,
      trackingNumber,
    });
    return res.data.data;
  },

  async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; meta: any }> {
    const res = await apiClient.get<ApiResponse<User[]>>(`/admin/users?page=${page}&limit=${limit}`);
    return {
      users: res.data.data,
      meta: res.data.meta,
    };
  },
};
