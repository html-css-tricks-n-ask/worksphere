
import { Types } from 'mongoose';

import { tenantStorage } from '../utils/tenantContext.js';

export const tenantMiddleware = (
  req,
  res,
  next
) => {
  if (req.user) {
    try {
      const companyIdObj = req.user.companyId ? new Types.ObjectId(req.user.companyId) : null;
      const isSuperAdmin = req.user.role === 'Super Admin';
      
      tenantStorage.run({ companyId: companyIdObj, bypass: isSuperAdmin }, () => {
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
