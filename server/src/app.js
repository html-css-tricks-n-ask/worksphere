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
import { existsSync } from 'fs';

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
  'https://worksphere-7421.vercel.app',
  process.env.CLIENT_URL, // allow dynamic client URL from env
].filter(Boolean) ;

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

// Root ping route — for Render health probes and API status checks
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'WorkSphere API',
    status: 'UP',
    version: 'v1',
    env: process.env.NODE_ENV || 'development',
    docs: '/api-docs',
    health: '/api/v1/health',
  });
});

// ─── Serve React SPA in Production (Docker only) ────────────────────────────
// Only activates when the client build exists (dist/public/index.html)
// On Render API-only deployments this folder won't exist — skipped safely.
const clientBuildPath = path.join(__dirname, 'public');
const indexHtmlPath = path.join(clientBuildPath, 'index.html');

if (existsSync(indexHtmlPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/api-docs')) {
      return next(new ApiError(404, `Route ${req.originalUrl} (${req.method}) not found`));
    }
    res.sendFile(indexHtmlPath);
  });
} else {
  // Pure API mode — 404 all non-API routes
  app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} (${req.method}) not found`));
  });
}

// Global Error handling middleware
app.use(errorHandler);

export { app };
export default app;
