import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { OrderService } from '../services/order.service';
import { sendSuccess } from '../utils/response';

export class AdminController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboardMetrics();
      sendSuccess(res, data, 'Metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
      const status = req.query.status as string | undefined;

      const result = await AdminService.getAllOrders(page, limit, status);
      sendSuccess(res, result.orders, 'All orders retrieved', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const order = await OrderService.updateOrderStatus(id, req.body);
      sendSuccess(res, order, 'Order status updated');
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await AdminService.getAllUsers(page, limit);
      sendSuccess(res, result.users, 'All users retrieved', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}
