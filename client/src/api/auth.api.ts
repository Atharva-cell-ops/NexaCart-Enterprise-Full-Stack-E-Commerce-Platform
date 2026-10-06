import { apiClient } from './client';
import { ApiResponse, User, Address } from '../types';

export const authApi = {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> {
    const res = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    return res.data.data;
  },

  async getAddresses(): Promise<Address[]> {
    const res = await apiClient.get<ApiResponse<Address[]>>('/auth/addresses');
    return res.data.data;
  },

  async addAddress(data: Omit<Address, 'id' | 'userId'>): Promise<Address> {
    const res = await apiClient.post<ApiResponse<Address>>('/auth/addresses', data);
    return res.data.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/auth/addresses/${id}`);
  },
};
