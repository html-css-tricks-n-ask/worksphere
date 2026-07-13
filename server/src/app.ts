import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';

// Configs and routes
dotenv.config();
import { swaggerSpec } from './config/swagger.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiError } from './utils/responseWrapper.js';


const app = express();

// Security HTTP Headers
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://worksphere-eeui.vercel.app',
];

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  maxAge: 86400, // Cache preflight OPTIONS requests for 24 hours
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

// ─── Serve React SPA in Production ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the built React client
  const clientBuildPath = path.join(__dirname, 'public');
  app.use(express.static(clientBuildPath));

  // SPA Fallback: for any non-API route, send index.html so React Router works
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/api-docs')) {
      return next(new ApiError(404, `Route ${req.originalUrl} (${req.method}) not found`));
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Handle undefined API routes in development (404)
  app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} (${req.method}) not found`));
  });
}

// Global Error handling middleware
app.use(errorHandler);

export { app };
export default app;
