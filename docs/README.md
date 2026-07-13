# WorkSphere Documentation Portal

WorkSphere is a production-ready, enterprise-grade multi-tenant Employee Management & HRMS SaaS platform. It enables organizations to provision isolated workspaces (tenants) and manage employees, payroll, attendance, leave, expenses, and role-based permissions, backed by an AI HR Chatbot assistant.

This `/docs` folder contains comprehensive system engineering documentation, architecture diagrams, database schemas, and developer resources.

---

## 📖 Table of Contents

Explore the system design and implementation details across these documents:

1. **[Architecture & Design Patterns](architecture.md)** — Architectural style, Clean Architecture (Controller-Service-Repository), and multi-tenant context propagation.
2. **[System Design & Diagrams](system_design.md)** — High-level diagrams, sequence flows, and system integration patterns.
3. **[Database Schema Design](database.md)** — Collection schemas, indexes strategy, relationships, and soft-delete plugins.
4. **[API Specification](api.md)** — Swagger specs, REST endpoints, input validations, and HTTP response codes.
5. **[Security Architecture](security.md)** — JWT rotation, cookie-based token safety, RBAC middleware, Helmet, and rate limiting.
6. **[Frontend Engineering Guide](frontend.md)** — React & TypeScript component design, Redux Toolkit, TanStack Query, and lazy loading.
7. **[Backend Engineering Guide](backend.md)** — Express configuration, request lifecycle, error handling, and daily Winston log rotation.
8. **[Cloud Services Integration](cloud_services.md)** — How MongoDB Atlas, Cloudinary, SMTP, and Render are integrated.
9. **[Project Structure Directory](project_structure.md)** — Complete file-by-file organization of both `/client` and `/server`.
10. **[Deployment & Orchestration](deployment.md)** — Docker Compose configuration, hosting on Vercel/Render, and network isolation.
11. **[System Architecture Interview Guide](interview_guide.md)** — 50 comprehensive interview questions and technical answers based on this project.
12. **[LinkedIn Portfolio Showcase](linkedin_post.md)** — Recruiter-friendly summary and copy-pasteable post highlighting MERN engineering skills.

---

## 🛠️ Tech Stack & Pillars

### Core Architecture
- **Multi-Tenancy**: Dynamic schema-level data separation via `AsyncLocalStorage` and Mongoose query interceptors.
- **Clean Architecture**: Strong boundary isolation: Express Routes ➔ Controllers ➔ Services ➔ Repositories.
- **AI Chatbot**: Intelligent context-aware helper interacting with live tenant databases.

### Frontend
- React 18, Vite, TypeScript, React Router v6
- Redux Toolkit (auth, notifications)
- TanStack React Query v5 (caching, optimistic updates)
- React Hook Form, Zod (schema validation)
- Tailwind CSS & Lucide Icons

### Backend & Storage
- Node.js, Express.js, TypeScript
- MongoDB Atlas (Mongoose ODM)
- JWT & HTTP-Only cookies (refresh token rotation)
- Cloudinary API (storage and image transformations)
- Nodemailer SMTP (email alerts)
- Winston (Daily file rotation logging)

---

## 🚀 Setup & Execution

### 1. Database Seeding
To populate the database with a pre-configured tenant (Demo Corp Ltd), departments, and admin/employee credentials:
```bash
cd server
npm run seed
```
**Default Credentials:**
- **Company Admin**: `neha@pixelcraft.io` / `Pixel@123`
- **Employee**: `employee@worksphere.com` / `Employee@123`

### 2. Run Local Development
**Server (`http://localhost:5002`):**
```bash
cd server
npm run dev
```

**Client (`http://localhost:3000`):**
```bash
cd client
npm run dev
```

### 3. Production Docker Orchestration
Build the multi-stage frontend/backend image, spin up MongoDB, and bridge networks:
```bash
docker compose up --build -d
```
The application will run unified at `http://localhost:5002`.
