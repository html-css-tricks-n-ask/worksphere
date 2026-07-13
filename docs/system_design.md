# System Design & Diagrams

This document contains high-level and low-level system designs, database representations, sequence flows, and request lifecycle architectures for **WorkSphere**.

---

## 🗺️ 1. High-Level Architecture

The platform separates client requests, application processing layers, secure external storage, database storage, and notification channels:

```mermaid
graph TB
  subgraph Client Environment
    Browser[React SPA Client]
    Mobile[Web View / Socket Client]
  end

  subgraph Route Routing & Protection
    VercelEdge[Vercel Frontend CDN]
    RenderRouter[Render API Routing]
    RateLimiter[express-rate-limit Gate]
  end

  subgraph Application Logic Server
    Express[Express.js App]
    SocketGateway[Socket.io Gateway]
    Winston[Winston Logs Rotation]
  end

  subgraph Cloud Providers
    Atlas[MongoDB Atlas Cluster]
    Cloudinary[Cloudinary CDN Store]
    SMTP[SMTP Email Server]
  end

  Browser -->|HTTPS| VercelEdge
  Browser -->|API Calls / REST| RenderRouter
  Mobile -->|WebSocket Connection| SocketGateway
  RenderRouter -->|Filter Traffic| RateLimiter
  RateLimiter -->|Process Requests| Express
  Express -->|Read / Write| Atlas
  Express -->|Upload Media| Cloudinary
  Express -->|Send Emails| SMTP
  SocketGateway -->|Push Events| Browser
```

---

## 🔑 2. Authentication & JWT Token Lifecycle

WorkSphere implements **Refresh Token Rotation (RTR)** to protect session security. Access tokens are transient, while refresh tokens are stored securely in HttpOnly cookies.

```mermaid
sequenceDiagram
  autonumber
  actor User as Browser Client
  participant API as Express Server
  participant DB as MongoDB Atlas

  User->>API: POST /api/v1/auth/login (email, password)
  API->>DB: Query User (select +password)
  DB-->>API: User Data + Hashed Password
  Note over API: Compare bcrypt passwords
  API->>API: Sign Access Token (15m expiry)
  API->>API: Sign Refresh Token (7d expiry)
  API->>DB: Save Refresh Token Metadata (if applicable)
  Note over API: Set HttpOnly Cookie (secure, sameSite)
  API-->>User: Return Access Token + User Info (JSON)

  Note over User: User requests dashboard with Auth Header Bearer
  User->>API: GET /api/v1/employees (Bearer token)
  API-->>User: 200 OK (Data payload)

  Note over User: Access Token Expires
  User->>API: POST /api/v1/auth/refresh (Cookie header)
  API->>API: Verify Refresh Token Signature
  API->>API: Issue New Access Token
  API-->>User: Return New Access Token (JSON)
```

---

## 🏢 3. Organization Provisioning Flow

Organizations provision isolated spaces automatically upon registration:

```mermaid
sequenceDiagram
  autonumber
  actor Admin as Org Admin
  participant API as Express Server
  participant DB as MongoDB Atlas
  participant Mail as SMTP Mailer

  Admin->>API: POST /api/v1/auth/register
  Note over API: Validate input via Zod schemas
  API->>DB: Check email duplicate (Company & User)
  DB-->>API: Unique checked
  API->>DB: Create Company (Tenant doc)
  DB-->>API: Company ID generated
  API->>API: Hash Admin Password
  API->>DB: Create Admin User (status: Pending, linked to Company ID)
  API->>DB: Create CompanySettings & Default Shifts
  API->>Mail: Dispatch verifyEmail template with verificationToken
  API-->>Admin: 201 Created (Please verify your email)
```

---

## 📊 4. Leave Application & Approval Flow

Leave requests are tracked dynamically. Validation rules verify employee balances before routing decisions:

```mermaid
graph TD
  Start([Employee initiates Leave Application]) --> ValidateParams[Validate parameters: dates, leaveType]
  ValidateParams --> GetBalance[Query Leave Balance document]
  GetBalance --> CheckQuota{Is Balance >= Requested Days?}

  CheckQuota -- No --> RejectRequest[Return 400 Bad Request: Insufficient balance]
  CheckQuota -- Yes --> CreateLeave[Create Leave document: status = Pending]

  CreateLeave --> NotifyManager[Create Notification & emit Socket.io event to Manager]
  NotifyManager --> Decision{Manager review action}

  Decision -- Reject --> UpdateRejected[Update Leave status = Rejected]
  UpdateRejected --> RestoreBalance[Do not deduct balance]
  RestoreBalance --> NotifyEmployeeReject[Notify Employee: Leave Rejected]

  Decision -- Approve --> UpdateApproved[Update Leave status = Approved]
  UpdateApproved --> DeductBalance[Deduct requested days from Employee's Leave Balance]
  DeductBalance --> NotifyEmployeeApprove[Notify Employee: Leave Approved]

  RejectRequest --> End([Process Ended])
  NotifyEmployeeReject --> End
  NotifyEmployeeApprove --> End
```

---

## 🗄️ 5. Database Schema Relationships

The MERN database uses a referenced document design. Scoping to the parent organization is enforced by `companyId`:

```mermaid
erDiagram
  COMPANIES {
    ObjectId _id PK
    String name
    String slug
    String email
    String status
  }
  COMPANY_SETTINGS {
    ObjectId _id PK
    ObjectId companyId FK
    String currency
    String timezone
    Number[] weekendDays
  }
  USERS {
    ObjectId _id PK
    ObjectId companyId FK
    String firstName
    String lastName
    String email
    String password
    String role
    String status
    Boolean emailVerified
  }
  EMPLOYEES {
    ObjectId _id PK
    ObjectId userId FK
    ObjectId companyId FK
    String employeeId
    String firstName
    String lastName
    String email
    Object professionalInfo
  }
  SALARY_STRUCTURES {
    ObjectId _id PK
    ObjectId employeeId FK
    ObjectId companyId FK
    Number basicSalary
    Number hra
    Number netSalary
  }
  PAYROLLS {
    ObjectId _id PK
    ObjectId employeeId FK
    ObjectId companyId FK
    String month
    Number netSalary
    String status
  }
  REIMBURSEMENTS {
    ObjectId _id PK
    ObjectId employeeId FK
    ObjectId companyId FK
    String title
    Number amount
    String status
  }

  COMPANIES ||--o{ COMPANY_SETTINGS : has
  COMPANIES ||--o{ USERS : owns
  COMPANIES ||--o{ EMPLOYEES : employs
  USERS ||--o| EMPLOYEES : profiles
  EMPLOYEES ||--o{ SALARY_STRUCTURES : has
  EMPLOYEES ||--o{ PAYROLLS : receives
  EMPLOYEES ||--o{ REIMBURSEMENTS : claims
```

---

## 🔄 6. Request & Response Lifecycle

The flow diagram below details the boundary states a client request undergoes, mapping the frontend Axios lifecycle to backend processing and error traps:

```
[Browser Action]
   │
   ▼
[Axios Interceptor] (Attach JWT Bearer token)
   │
   ▼
[Network Transport]
   │
   ▼
[Express Server] ──► [CORS & Rate Limiter validation]
                         │ (If fails)
                         ├─────────────────────────────► [429 / 403 Response]
                         │ (If passes)
                         ▼
                     [Auth Middleware Verification]
                         │ (If token expired)
                         ├─────────────────────────────► [401 Unauthorized]
                         │ (If valid)
                         ▼
                     [tenantMiddleware injection]
                     (Set AsyncLocalStorage tenant context)
                         │
                         ▼
                     [Zod Schema Validator]
                         │ (If invalid payload)
                         ├─────────────────────────────► [400 Bad Request]
                         │ (If valid)
                         ▼
                     [Controller Layer]
                         │
                         ▼
                     [Service Layer] (Calculations, db transactions)
                         │
                         ▼
                     [Mongoose Query Interceptor] (Auto-inject companyId)
                         │
                         ▼
                     [MongoDB Atlas Store]
                         │
                         ▼
                     [ApiResponse Formatter] (200 / 201 JSON standard wrapper)
                         │
                         ▼
[Axios Success Interceptor] ──► [React Component State Update]
```
