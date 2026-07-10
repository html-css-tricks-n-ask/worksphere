import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/responseWrapper.js';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication credentials were not provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired access token.');
  }
};

export const requirePermissions = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'User is not authenticated.');
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }

    next();
  };
};
