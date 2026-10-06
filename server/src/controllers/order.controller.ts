import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { sendSuccess, sendCreated } from '../utils/response';

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.createOrder(req.user!.userId, req.body);
      sendCreated(res, order, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getUserOrders(req.user!.userId);
      sendSuccess(res, orders, 'Orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = req.user?.role === 'ADMIN' ? undefined : req.user!.userId;
      const order = await OrderService.getOrderById(id, userId);
      sendSuccess(res, order, 'Order details retrieved');
    } catch (error) {
      next(error);
    }
  }
}
