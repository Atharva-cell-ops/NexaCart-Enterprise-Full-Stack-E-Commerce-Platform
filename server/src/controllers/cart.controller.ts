import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { sendSuccess } from '../utils/response';

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.getCart(req.user!.userId);
      sendSuccess(res, cart, 'Cart retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.addItem(req.user!.userId, req.body);
      sendSuccess(res, cart, 'Item added to cart');
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const cart = await CartService.updateItem(
        req.user!.userId,
        id,
        req.body
      );
      sendSuccess(res, cart, 'Cart item updated');
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const cart = await CartService.removeItem(req.user!.userId, id);
      sendSuccess(res, cart, 'Cart item removed');
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CartService.clearCart(req.user!.userId);
      sendSuccess(res, result, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  }

  static async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CartService.validateCoupon(req.body);
      sendSuccess(res, result, 'Coupon validated');
    } catch (error) {
      next(error);
    }
  }
}
