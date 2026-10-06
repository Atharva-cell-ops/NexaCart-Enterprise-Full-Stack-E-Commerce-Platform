import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { sendCreated } from '../utils/response';

export class ReviewController {
  static async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;

      const review = await ReviewService.addReview(
        req.user!.userId,
        productId,
        req.body
      );
      sendCreated(res, review, 'Review submitted successfully');
    } catch (error) {
      next(error);
    }
  }
}
