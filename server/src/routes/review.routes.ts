import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createReviewSchema } from '../schemas/review.schema';

const router = Router();

router.post('/:productId', authenticate, validateBody(createReviewSchema), ReviewController.addReview);

export default router;
