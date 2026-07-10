import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from './auth.js';
import { tenantStorage } from '../utils/tenantContext.js';

export const tenantMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.companyId) {
    try {
      const companyIdObj = new Types.ObjectId(req.user.companyId);
      tenantStorage.run(companyIdObj, () => {
        next();
      });
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
};

export default tenantMiddleware;
