import { apiClient } from './client';
import { ApiResponse, Cart, CouponValidation } from '../types';

export const cartApi = {
  async getCart(): Promise<Cart> {
    const res = await apiClient.get<ApiResponse<Cart>>('/cart');
    return res.data.data;
  },

  async addItem(productId: string, quantity: number = 1): Promise<Cart> {
    const res = await apiClient.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
    return res.data.data;
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const res = await apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    return res.data.data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const res = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return res.data.data;
  },

  async clearCart(): Promise<void> {
    await apiClient.delete('/cart');
  },

  async validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
    const res = await apiClient.post<ApiResponse<CouponValidation>>('/cart/validate-coupon', {
      code,
      subtotal,
    });
    return res.data.data;
  },
};
