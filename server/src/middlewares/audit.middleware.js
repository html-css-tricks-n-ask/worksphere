 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { auditLogRepository } from '../repositories/auditLog.repository.js';
import { logger } from '../config/logger.js';

export const auditMiddleware = (actionName) => {
  return (req, res, next) => {
    res.on('finish', async () => {
      // Only audit successful mutations (status code 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const actorId = _optionalChain([req, 'access', _ => _.user, 'optionalAccess', _2 => _2.userId]);
          const companyId = _optionalChain([req, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.companyId]);

          if (actorId && companyId) {
            // Scrub sensitive payload fields (like password) from logged details
            const cleanBody = req.body ? { ...req.body } : undefined;
            if (cleanBody) {
              if (cleanBody.password) cleanBody.password = '*****';
              if (_optionalChain([cleanBody, 'access', _5 => _5.admin, 'optionalAccess', _6 => _6.password])) cleanBody.admin.password = '*****';
            }

            await auditLogRepository.create({
              actorId: actorId ,
              action: actionName,
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.get('User-Agent'),
              details: {
                method: req.method,
                path: req.originalUrl,
                params: req.params,
                query: req.query,
                body: cleanBody,
              } ,
              companyId: companyId ,
            });
          }
        } catch (error) {
          logger.error(`Failed to log audit event: ${(error ).message}`);
        }
      }
    });
    next();
  };
};

export default auditMiddleware;
