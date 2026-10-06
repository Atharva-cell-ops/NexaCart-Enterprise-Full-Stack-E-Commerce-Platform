import { prisma } from '../utils/prisma';
import { AppError } from '../utils/app-error';
import { ProductQueryInput, CreateProductInput, UpdateProductInput } from '../schemas/product.schema';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export class ProductService {
  static async getProducts(query: ProductQueryInput) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort,
      page,
      limit,
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { rating: 'desc' };
    if (sort === 'popular') orderBy = { reviewCount: 'desc' };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    }));

    return {
      products: formattedProducts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getFeaturedProducts() {
    const products = await prisma.product.findMany({
      where: { featured: true },
      take: 8,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    return products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    }));
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    // Get related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return {
      ...product,
      images: JSON.parse(product.images || '[]'),
      relatedProducts: relatedProducts.map((p) => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
      })),
    };
  }

  static async createProduct(input: CreateProductInput) {
    let slug = slugify(input.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        discountPercent: input.discountPercent || 0,
        stock: input.stock,
        sku: input.sku,
        images: JSON.stringify(input.images),
        featured: input.featured || false,
        categoryId: input.categoryId,
      },
      include: { category: true },
    });

    return {
      ...product,
      images: JSON.parse(product.images || '[]'),
    };
  }

  static async updateProduct(id: string, input: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Product not found');

    const data: any = { ...input };
    if (input.images) {
      data.images = JSON.stringify(input.images);
    }
    if (input.name && input.name !== existing.name) {
      data.slug = `${slugify(input.name)}-${Date.now().toString().slice(-4)}`;
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return {
      ...updated,
      images: JSON.parse(updated.images || '[]'),
    };
  }

  static async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Product not found');

    await prisma.product.delete({ where: { id } });
    return { success: true, message: 'Product successfully deleted' };
  }
}
