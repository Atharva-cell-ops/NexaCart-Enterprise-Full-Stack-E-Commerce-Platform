import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { updateOrderStatusSchema } from '../schemas/order.schema';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, requireAdmin);

router.get('/metrics', AdminController.getDashboardMetrics);
router.get('/orders', AdminController.getAllOrders);
router.patch('/orders/:id/status', validateBody(updateOrderStatusSchema), AdminController.updateOrderStatus);
router.get('/users', AdminController.getAllUsers);

export default router;
