import { apiClient } from './client';
import { ApiResponse, Product, Category, Review } from '../types';

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; meta: any }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minRating !== undefined) params.append('minRating', filters.minRating.toString());
    if (filters.inStock) params.append('inStock', 'true');
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const res = await apiClient.get<ApiResponse<Product[]>>(`/products?${params.toString()}`);
    return {
      products: res.data.data,
      meta: res.data.meta,
    };
  },

  async getFeatured(): Promise<Product[]> {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products/featured');
    return res.data.data;
  },

  async getProductBySlug(slug: string): Promise<Product & { relatedProducts: Product[]; reviews: Review[] }> {
    const res = await apiClient.get<ApiResponse<Product & { relatedProducts: Product[]; reviews: Review[] }>>(`/products/${slug}`);
    return res.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  async addReview(productId: string, data: { rating: number; comment: string }): Promise<Review> {
    const res = await apiClient.post<ApiResponse<Review>>(`/reviews/${productId}`, data);
    return res.data.data;
  },
};
