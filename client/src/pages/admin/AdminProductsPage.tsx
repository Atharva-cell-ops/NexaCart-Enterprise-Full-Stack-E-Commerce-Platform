import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { adminApi } from '../../api/admin.api';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().min(3, 'SKU is required'),
  imageUrl: z.string().url('Must be a valid image URL'),
  categoryId: z.string().min(1, 'Category is required'),
  featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Queries
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', searchTerm],
    queryFn: () => productsApi.getProducts({ search: searchTerm || undefined, limit: 50 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  const products = productsData?.products || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const openCreateModal = () => {
    reset({
      name: '',
      description: '',
      price: 99.99,
      discountPercent: 0,
      stock: 20,
      sku: `NC-${Date.now().toString().slice(-6)}`,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      categoryId: categories[0]?.id || '',
      featured: false,
    });
    setEditingProduct(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    const images = Array.isArray(p.images) ? p.images : JSON.parse((p.images as any) || '[]');
    reset({
      name: p.name,
      description: p.description,
      price: p.price,
      discountPercent: p.discountPercent,
      stock: p.stock,
      sku: p.sku,
      imageUrl: images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      categoryId: p.categoryId,
      featured: p.featured,
    });
    setIsCreateModalOpen(true);
  };

  const onSubmitProduct = async (data: ProductFormData) => {
    try {
      const payload = {
        ...data,
        images: [data.imageUrl],
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
        success(`Updated "${data.name}" successfully!`);
      } else {
        await adminApi.createProduct(payload);
        success(`Product "${data.name}" created successfully!`);
      }

      setIsCreateModalOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      toastError(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await adminApi.deleteProduct(deletingProduct.id);
      success(`Product "${deletingProduct.name}" removed from catalog.`);
      setDeletingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      toastError(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Product Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage SKU listings, stock availability, pricing, and discounts.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          Showing {products.length} products
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px] bg-slate-900/40">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-3">SKU</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Price</th>
                <th className="py-3.5 px-3">Discount</th>
                <th className="py-3.5 px-3">Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const img =
                    (Array.isArray(p.images) ? p.images[0] : JSON.parse(p.images as any)[0]) ||
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-800 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-white truncate">{p.name}</p>
                            {p.featured && (
                              <span className="text-[10px] text-indigo-400 font-extrabold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {p.category?.name || 'Uncategorized'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white">${p.price.toFixed(2)}</td>
                      <td className="py-3.5 px-3">
                        {p.discountPercent > 0 ? (
                          <span className="text-emerald-400 font-bold">-{p.discountPercent}%</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                            p.stock > 10
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                              : p.stock > 0
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Create New Product'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-4 text-left">
          <Input
            label="Product Title"
            placeholder="e.g. Aether Pro Spatial Wireless Headphones"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU Identifier"
              placeholder="e.g. AETH-PRO-BLK"
              error={errors.sku?.message}
              {...register('sku')}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
                Category
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register('categoryId')}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Base Price ($)"
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Discount (%)"
              type="number"
              step="1"
              error={errors.discountPercent?.message}
              {...register('discountPercent')}
            />
            <Input
              label="Inventory Units"
              type="number"
              step="1"
              error={errors.stock?.message}
              {...register('stock')}
            />
          </div>

          <Input
            label="Main Product Image (URL)"
            placeholder="https://images.unsplash.com/..."
            error={errors.imageUrl?.message}
            {...register('imageUrl')}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
              Product Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide a compelling overview of specifications and features..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              {...register('featured')}
            />
            <span className="text-xs font-semibold text-slate-700">
              Highlight as Featured on Homepage Flagship Showcase
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <Modal
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          title="Confirm Product Deletion"
          maxWidth="sm"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">"{deletingProduct.name}"</strong>? This will remove it from customer catalogs immediately.
            </p>

            <div className="flex gap-2 justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingProduct(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
