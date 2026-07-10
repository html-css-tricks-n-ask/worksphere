import 'dotenv/config';

import { createServer } from 'http';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5002;

// Catch Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down server gracefully...', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Run Server
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Create HTTP Server wrapping Express app
  const httpServer = createServer(app);

  // Initialize Socket.io connection manager
  initSocket(httpServer);

  const server = httpServer.listen(PORT, () => {
    logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`Swagger API Documentation is available at http://localhost:${PORT}/api-docs`);
  });

  // Catch Unhandled Promise Rejections
  process.on('unhandledRejection', (reason: any) => {
    logger.error('UNHANDLED REJECTION! Shutting down server gracefully...', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
