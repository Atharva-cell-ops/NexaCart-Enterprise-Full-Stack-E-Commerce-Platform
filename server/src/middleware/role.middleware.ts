import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(`Access denied: Requires ${allowedRoles.join(' or ')} privileges`)
      );
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMIN']);
