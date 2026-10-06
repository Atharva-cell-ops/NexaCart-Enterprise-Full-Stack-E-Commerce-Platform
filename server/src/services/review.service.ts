import { prisma } from '../utils/prisma';
import { AppError } from '../utils/app-error';
import { CreateReviewInput } from '../schemas/review.schema';

export class ReviewService {
  static async addReview(userId: string, productId: string, input: CreateReviewInput) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    const existing = await prisma.review.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      throw AppError.conflict('You have already submitted a review for this product');
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: input.rating,
        comment: input.comment,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    // Recalculate average product rating and reviewCount
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const reviewCount = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (reviewCount || 1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Number(avgRating.toFixed(1)),
        reviewCount,
      },
    });

    return review;
  }
}
