import { apiClient } from './client';
import { ApiResponse, Order } from '../types';

export const ordersApi = {
  async createOrder(data: {
    addressId?: string;
    newAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
    };
    paymentMethod: string;
    couponCode?: string;
    shippingOption?: 'STANDARD' | 'EXPRESS';
    items?: Array<{ productId: string; quantity: number }>;
  }): Promise<Order> {
    const res = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return res.data.data;
  },

  async getUserOrders(): Promise<Order[]> {
    const res = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return res.data.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },
};
