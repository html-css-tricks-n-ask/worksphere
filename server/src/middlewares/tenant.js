
import { Types } from 'mongoose';

import { tenantStorage } from '../utils/tenantContext.js';

export const tenantMiddleware = (
  req,
  res,
  next
) => {
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
