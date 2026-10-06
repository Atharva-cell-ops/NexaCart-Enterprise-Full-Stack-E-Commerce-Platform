import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  addToCartSchema,
  updateCartItemSchema,
  validateCouponSchema,
} from '../schemas/cart.schema';

const router = Router();

router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/items', validateBody(addToCartSchema), CartController.addItem);
router.put('/items/:id', validateBody(updateCartItemSchema), CartController.updateItem);
router.delete('/items/:id', CartController.removeItem);
router.delete('/', CartController.clearCart);
router.post('/validate-coupon', validateBody(validateCouponSchema), CartController.validateCoupon);

export default router;
