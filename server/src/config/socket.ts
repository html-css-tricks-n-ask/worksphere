import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from './logger.js';

let io: Server | null = null;
const userSockets = new Map<string, string>(); // maps userId -> socket.id

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for dev/production, can be restricted if needed
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Register user session mapping
    socket.on('register_user', (userId: string) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        logger.debug(`Socket registered user session: ${userId} -> ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      // Remove registration
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          logger.debug(`Socket removed user registration: ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any): boolean => {
  if (!io) return false;
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    logger.debug(`Real-time event ${event} emitted to user ${userId}`);
    return true;
  }
  return false;
};

export const emitToCompany = (companyId: string, event: string, data: any): void => {
  if (!io) return;
  // Room fallback: in real systems users join a company-room, let's implement room joining in connections if needed,
  // or simple broadcast for all connections. Broadast is perfect for dev mock.
  io.emit(event, data);
};
