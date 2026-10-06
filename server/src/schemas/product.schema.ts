import { z } from 'zod';

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  minRating: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  inStock: z.string().optional().transform((val) => val === 'true'),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular']).default('newest'),
  page: z.string().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
  limit: z.string().default('12').transform((val) => Math.min(50, Math.max(1, parseInt(val, 10)))),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than 0'),
  discountPercent: z.number().min(0).max(100).default(0),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().min(3, 'SKU is required'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  featured: z.boolean().default(false),
  categoryId: z.string().min(1, 'Category is required'),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
