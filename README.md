# WorkSphere – Enterprise Employee Management SaaS

WorkSphere is a production-ready, highly scalable multi-tenant Employee Management SaaS (similar to BambooHR, Zoho People, and Rippling) supporting secure tenant separation, high performance, and future AI enhancements.

---

## 🌟 Core Features (Phase 5, 6 & 7 Complete)

1. **Multi-Tenant Architecture**: Complete data isolation via Mongoose query interceptors.
2. **Salary Structure Configs**: Setup basic pay, HRA, special allowances, conveyance, and tax deductions (PF, ESI, TDS) per employee.
3. **Payroll Compute Runs**: Auto-generate monthly draft salaries with locked pay states, PDF downloads, and email payslip attachments.
4. **Expense Claims System**: Create reimbursement claims with category splits, receipts tracking, and multi-tier approval actions.
5. **Career Milestones Log**: Audit and view salary revision increments timeline logs.
6. **Real-time Notifications bell**: In-app popups, read notifications checklists, and instant Socket.io client syncs.
7. **AI HR Chatbot Assistant**: Ask questions using natural-language processing ("Who is on leave today?", "Summarize payroll costs").
8. **Company Configurations Overrides**: Setup weekend rest days (Saturday/Sunday checkboxes), office hour shifts, and leave quotas.
9. **Role Permission Matrix**: Granular modular access controls across Company Admin, HR, Manager, and Employee.
10. **Winston File Rotation**: Rotate log files daily to protect log history limits.
11. **Security Protections**: Zod validation filters, Helmet headers, CORS OPTIONS cache configurations, and rate-limiting exceptions in DEV.
12. **Dockerized Environment**: Fully containerized production orchestration utilizing Dockerfiles and Compose configurations.
13. **Robust Test Coverage**: 30 Jest test suites verifying repositories, authentications, leave balances, and salary computations.

---

## 📁 Repository Structure

```
worksphere/
├── client/                     # Frontend Vite-React App
│   ├── src/
│   │   ├── components/         # Reusable layouts, bell drawers, AI chatbot
│   │   ├── pages/              # Payroll dashboard, salary forms, claim matrices, settings
│   │   ├── routes/             # App routing config
│   │   ├── redux/              # Redux auth state slices
│   │   └── services/           # Axios instance
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     # Backend Node-Express App
│   ├── src/
│   │   ├── config/             # DB, Winston, Socket Gateway config
│   │   ├── controllers/        # Request controllers
│   │   ├── services/           # Business logic, payslip generation, Open AI Chat
│   │   ├── repositories/       # Mongoose queries isolation layer
│   │   ├── models/             # Database Schemas
│   │   ├── routes/             # API route controllers mounts
│   │   └── scripts/            # Database seed.ts tool
│   ├── tests/                  # Jest units tests suite
│   ├── package.json
│   └── tsconfig.json
│
├── Dockerfile                  # Production Multi-Stage builds
└── docker-compose.yml          # Container configuration orchestrator
```

---

## 🚀 Setup & Run Commands

### Prerequisites
- Node.js (v20+)
- MongoDB Atlas credentials or Local Server
- Docker Desktop

### 1. Database Seeding Setup
Populate the database with a pre-configured Company (Demo Corp Ltd), Department (Engineering, HR), salary structures, attendance history, and two demo users:
```bash
cd server
npm run seed
```
**Credentials Generated:**
- **Company Admin**: `admin@worksphere.com` / `Admin@123`
- **Employee**: `employee@worksphere.com` / `Employee@123`

### 2. Local Execution (Development Mode)
- **Start Backend API Server** (`http://localhost:5002`):
  ```bash
  cd server
  npm run dev
  ```
- **Start Frontend Vite Dev Client** (`http://localhost:3000`):
  ```bash
  cd client
  npm run dev
  ```

### 3. Build & Run in Production Docker
Build both the frontend and backend inside a multi-stage production container, bridge them onto a common network, and boot with a MongoDB container:
```bash
docker-compose up --build
```
The Frontend public app and API Gateway will run unified at `http://localhost:5002`.

### 4. Running Verification Unit Tests
Execute the Jest unit tests suite covering core services and repositories:
```bash
cd server
npm run test
```
# worksphere
