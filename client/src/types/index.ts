export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CASH_ON_DELIVERY'
  | 'DEMO_PAYMENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  role: Role;
  createdAt: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPercent: number;
  stock: number;
  sku: string;
  images: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt?: string;
  discountedPrice?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  productId: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product & { discountedPrice: number };
  lineTotal: number;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shippingFee: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  total: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  summary: CartSummary;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  shippingAddress: Address;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  trackingNumber?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string | null;
  };
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountPercent: number;
  discountAmount: number;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  errors?: any;
}
