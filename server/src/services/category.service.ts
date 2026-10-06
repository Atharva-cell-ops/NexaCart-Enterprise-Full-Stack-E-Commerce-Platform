import { prisma } from '../utils/prisma';
import { AppError } from '../utils/app-error';
import { CreateCategoryInput } from '../schemas/product.schema';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export class CategoryService {
  static async getAllCategories() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
    }));
  }

  static async createCategory(input: CreateCategoryInput) {
    const slug = slugify(input.name);
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: input.name }, { slug }] },
    });

    if (existing) {
      throw AppError.conflict('Category with this name already exists');
    }

    return prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        imageUrl: input.imageUrl,
      },
    });
  }
}
