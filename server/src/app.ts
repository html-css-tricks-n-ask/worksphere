import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

// Configs and routes
dotenv.config();
import { swaggerSpec } from './config/swagger.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiError } from './utils/responseWrapper.js';

const app = express();

// Security HTTP Headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: true, // Allow all origins for development, can be configured via env
  credentials: true,
  maxAge: 86400, // Cache preflight OPTIONS requests for 24 hours to reduce browser requests overhead
}));

// Gzip compression
app.use(compression());

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Set very high limit for local development HMR/hot-reloads
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use('/api', limiter);

// Swagger Documentation Interface
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base API v1 Routes
app.use('/api/v1', apiRouter);

// Handle undefined routes (404)
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} (${req.method}) not found`));
});

// Global Error handling middleware
app.use(errorHandler);

export { app };
export default app;
