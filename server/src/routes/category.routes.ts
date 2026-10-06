import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createCategorySchema } from '../schemas/product.schema';

const router = Router();

router.get('/', CategoryController.getCategories);
router.post('/', authenticate, requireAdmin, validateBody(createCategorySchema), CategoryController.createCategory);

export default router;
