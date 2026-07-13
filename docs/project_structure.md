# Project Structure Directory

This document details the file-by-file organization and folder structure of **WorkSphere**'s frontend and backend applications.

---

## 📁 1. Global Repository Map

```
worksphere/
├── client/                     # Frontend Vite-React App
│   ├── public/                 # Static assets (icons, manifest.json)
│   ├── src/                    # React Source code
│   │   ├── app/                # Global setup (store, router)
│   │   ├── components/         # Shared presentation elements
│   │   ├── features/           # Sliced domain features (auth, leaves, payroll)
│   │   ├── layouts/            # View shells (Dashboard, Auth)
│   │   ├── providers/          # React Query / Redux wrapper gates
│   │   ├── redux/              # RTK slices and store
│   │   ├── routes/             # Client-side router path mappings
│   │   ├── services/           # Axios network configurations
│   │   ├── styles/             # Tailwind global configurations
│   │   └── utils/              # Client-side formatting helpers
│   ├── package.json            # Client dependency manifest
│   └── vite.config.ts          # Vite bundler parameters
│
├── server/                     # Backend Node-Express App
│   ├── src/                    # TypeScript backend source
│   │   ├── config/             # DB connection, Logger, Socket.io
│   │   ├── controllers/        # Express request routing controllers
│   │   ├── features/           # Decoupled domain models (auth logic)
│   │   ├── middlewares/        # Auth verify, tenant context, error boundary
│   │   ├── models/             # Mongoose database models
│   │   ├── repositories/       # Mongoose query isolation layer
│   │   ├── routes/             # Express routes mounts
│   │   ├── scripts/            # Database seed automation
│   │   ├── services/           # Domain business operations
│   │   ├── utils/              # Shared helper functions
│   │   └── validators/         # Zod schemas (request validator payload templates)
│   ├── package.json            # Backend dependency manifest
│   └── tsconfig.json           # Compiler rules for TypeScript
│
├── Dockerfile                  # Multi-Stage production image builder
└── docker-compose.yml          # Container configuration orchestrator
```

---

## 💻 2. Client Folder Breakdown (`/client/src/`)

- **`app/`**:
  - `store.ts`: Configures the global Redux store.
  - `router.tsx`: Map of routing paths.
- **`components/ui/`**:
  - Reusable components (e.g., `Button.tsx`, `Input.tsx`, `Card.tsx`) built using Tailwind CSS.
- **`features/`**:
  - **`auth/`**:
    - `api/auth.api.ts`: API endpoints (`/auth/login`, `/auth/register`).
    - `components/LoginForm.tsx`: Renders the login screen card.
    - `hooks/useLogin.ts`: Handles the login submit action, updates Redux, and handles errors.
    - `pages/LoginPage.tsx`: Login entry screen.
    - `schemas/auth.schema.ts`: Zod schema for client-side form validation.
    - `services/auth.service.ts`: Delegates calls from hooks to the API.
  - **`leaves/`**:
    - Contains leaves pages, custom hooks, and status tables.
  - **`payroll/`**:
    - Payroll grids, forms, and payout run buttons.
- **`layouts/`**:
  - `DashboardLayout.tsx`: Shell layout with the sidebar, header, and user profile widgets.
  - `AuthLayout.tsx`: Visual layout wrapper for registration/login pages.
- **`services/`**:
  - `axiosInstance.ts`: Custom Axios configuration. Sets the base URL, sets a **60s timeout**, sends the JWT auth header, and redirects the user to `/login` if a request returns `401 Unauthorized`.

---

## ⚙️ 3. Server Folder Breakdown (`/server/src/`)

- **`config/`**:
  - `db.ts`: Database connection setup using Mongoose.
  - `logger.ts`: Winston logging configuration.
  - `socket.ts`: Gateway manager for WebSocket connections.
- **`controllers/`**:
  - Thin express controllers (e.g., `employee.controller.ts`, `leave.controller.ts`) that parse HTTP requests and delegate execution to the service layer.
- **`middlewares/`**:
  - `auth.ts`: Verifies JWT tokens and checks user roles against allowed route permissions.
  - `tenant.ts`: Implements multi-tenancy. Extracts `companyId` from requests and propagates the context using `AsyncLocalStorage`.
  - `errorHandler.ts`: Catches runtime errors and formats them into a standard API response.
- **`models/`**:
  - Mongoose models (e.g., `Employee.ts`, `Leave.ts`, `User.ts`) representing collections. They import the soft-delete and tenant-isolation plugins to apply global database filters.
- **`repositories/`**:
  - Encapsulates database queries (e.g., `employee.repository.ts`, `payroll.repository.ts`). Decouples service logic from the database, keeping queries out of the business services.
- **`services/`**:
  - Services (e.g., `payroll.service.ts`, `email.service.ts`) containing core business logic.
- **`utils/`**:
  - `tenantContext.ts`: Implements `AsyncLocalStorage` to manage the active tenant context.
  - `responseWrapper.ts`: Defines `ApiResponse` and `ApiError` to standardise response formats.
