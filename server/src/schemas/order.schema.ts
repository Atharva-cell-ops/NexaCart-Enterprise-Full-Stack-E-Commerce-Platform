import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().optional(),
  newAddress: z
    .object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().default('United States'),
    })
    .optional(),
  paymentMethod: z
    .enum(['CREDIT_CARD', 'DEBIT_CARD', 'CASH_ON_DELIVERY', 'DEMO_PAYMENT'])
    .default('DEMO_PAYMENT'),
  couponCode: z.string().optional(),
  shippingOption: z.enum(['STANDARD', 'EXPRESS']).default('STANDARD'),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .optional(), // If provided, uses these items; otherwise uses user's database cart
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]),
  trackingNumber: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
