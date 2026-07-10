import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { auditLogRepository } from '../repositories/auditLog.repository.js';
import { logger } from '../config/logger.js';

export const auditMiddleware = (actionName: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    res.on('finish', async () => {
      // Only audit successful mutations (status code 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const actorId = req.user?.userId;
          const companyId = req.user?.companyId;

          if (actorId && companyId) {
            // Scrub sensitive payload fields (like password) from logged details
            const cleanBody = req.body ? { ...req.body } : undefined;
            if (cleanBody) {
              if (cleanBody.password) cleanBody.password = '*****';
              if (cleanBody.admin?.password) cleanBody.admin.password = '*****';
            }

            await auditLogRepository.create({
              actorId: actorId as any,
              action: actionName,
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.get('User-Agent'),
              details: {
                method: req.method,
                path: req.originalUrl,
                params: req.params,
                query: req.query,
                body: cleanBody,
              } as any,
              companyId: companyId as any,
            });
          }
        } catch (error) {
          logger.error(`Failed to log audit event: ${(error as Error).message}`);
        }
      }
    });
    next();
  };
};

export default auditMiddleware;
