import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addressSchema,
} from '../schemas/auth.schema';

const router = Router();

// Public auth routes
router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);

// Protected user routes
router.get('/me', authenticate, AuthController.me);
router.put('/profile', authenticate, validateBody(updateProfileSchema), AuthController.updateProfile);

// Saved Addresses
router.get('/addresses', authenticate, AuthController.getAddresses);
router.post('/addresses', authenticate, validateBody(addressSchema), AuthController.addAddress);
router.delete('/addresses/:id', authenticate, AuthController.deleteAddress);

export default router;
