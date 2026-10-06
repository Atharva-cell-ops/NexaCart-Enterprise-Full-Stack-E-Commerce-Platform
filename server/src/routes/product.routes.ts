import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
} from '../schemas/product.schema';

const router = Router();

// Public routes
router.get('/', validateQuery(productQuerySchema), ProductController.getProducts);
router.get('/featured', ProductController.getFeatured);
router.get('/:slug', ProductController.getProductBySlug);

// Admin-only product mutation routes
router.post('/', authenticate, requireAdmin, validateBody(createProductSchema), ProductController.createProduct);
router.put('/:id', authenticate, requireAdmin, validateBody(updateProductSchema), ProductController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, ProductController.deleteProduct);

export default router;
