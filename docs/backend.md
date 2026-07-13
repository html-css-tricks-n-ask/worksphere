# Backend Engineering Guide

This document details the Express.js architecture, API pipelines, error handling, and operational services implemented in the **WorkSphere** backend application.

---

## 🏛️ 1. Express & Node.js Application Design

The backend is built with Node.js and Express using TypeScript. The server runtime compile configuration compiles source TS code directly into ESM/CJS outputs in the `dist/` directory.

The application follows the Controller-Service-Repository pattern, separating the transport protocol (Express HTTP) from the business logic and database queries:

```
                  ┌──────────────────────┐
                  │    Express Router    │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
    [Controller Layer]               [Middleware Pipeline]
    - Parse Params                   - CORS & Helmet
    - standard ApiResponse           - Auth & Tenant scopes
    - Error Propagation              - Rate Limiter
            │
            ▼
    [Service Layer]
    - Core Business Calculations
    - Transaction Orchestration
    - External Cloud Services Integrations
            │
            ▼
    [Repository Layer]
    - Mongoose Queries
    - Tenant isolation logic
    - Projections & Populates
```

---

## ⚙️ 2. The Middleware Pipeline & Scopes

The request lifecycle is managed by an sequential middleware pipeline:

```ts
// 1. Security Headers Injection
app.use(helmet());

// 2. Cross-Origin Policy check
app.use(cors({ origin: allowedOrigins, credentials: true }));

// 3. Payload Compression
app.use(compression());

// 4. Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// 5. Rate Limiting Protection (enforced on /api routes)
app.use('/api', limiter);

// 6. Base Routes mount
app.use('/api/v1', apiRouter);

// 7. Undefined Route Handler (404)
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} (${req.method}) not found`));
});

// 8. Global Error Handler Catch-All
app.use(errorHandler);
```

---

## 💥 3. Standardized Error Handling Architecture

To prevent runtime crashes and ensure consistent API error responses, the application uses a centralized error-handling architecture.

### 1. `ApiError` class
An extension of the base JavaScript `Error` class, capturing HTTP status codes and validation payloads:
```ts
export class ApiError extends Error {
  statusCode: number;
  errors: any[];

  constructor(statusCode: number, message: string, errors: any[] = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

### 2. `asyncHandler` wrapper
A wrapper function that catches asynchronous exceptions and forwards them to the global error middleware, removing the need for repetitive `try-catch` blocks:
```ts
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### 3. Global `errorHandler` Middleware
Catches all exceptions (including database errors, token validation failures, and request timeouts). In production, it strips out the detailed error stack trace to prevent database schema leakage.

---

## 🪵 4. Logging & Daily Winston Rotation

To protect the server from infinite log file growth, the application integrates daily file rotation using **Winston**:

- **Console Transport (Active in all envs)**: Outputs colored, readable formats.
- **File Transports (Active in Development only)**:
  - Writes to `logs/combined-%DATE%.log` (all info/debug logs).
  - Writes to `logs/error-%DATE%.log` (only captures error stack traces).
  - Rotates daily (`zippedArchive: true`, `maxSize: '20m'`, `maxFiles: '14d'`).
- **Production Guard**: In production (like on Render), file-based logging is disabled since cloud environments have read-only filesystems. Logs are routed entirely to `process.stdout` so Render/Docker collectors can capture them.
