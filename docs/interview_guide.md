# System Architecture Interview Guide

This document contains 50 interview questions and answers based on the system design, architecture, and technology stack implemented in **WorkSphere**.

---

## 🛠️ Section 1: Multi-Tenancy & Database Design (Q1–Q12)

#### Q1: What multi-tenancy model does WorkSphere implement, and what are the trade-offs?
**Answer**: WorkSphere implements a **logical isolation** model (shared database, shared collections, scoped documents). 
- **Trade-offs**:
  - *Pros*: Highly cost-effective and easier to maintain. You run one MongoDB Atlas cluster instead of managing hundreds of separate databases. Upgrades, indexes, and migrations are applied globally in one step.
  - *Cons*: Higher risk of data leakage if the isolation logic fails. Requires careful query filtering, which we address using automated Mongoose query filters.

#### Q2: How do you prevent data leaks between tenants in this model?
**Answer**: We automate tenant isolation using Node's `AsyncLocalStorage` and Mongoose query middleware. We avoid manually appending `companyId` filters in controllers or repositories, as this is prone to developer oversight. Instead, the `tenantMiddleware` stores the `companyId` from the verified JWT in `AsyncLocalStorage`, and a Mongoose schema plugin automatically injects `{ companyId }` into all query filters.

#### Q3: Why did you choose AsyncLocalStorage over passing companyId as a parameter?
**Answer**: Passing `companyId` through controllers, services, and repositories creates tight coupling and is error-prone. `AsyncLocalStorage` provides a clean out-of-band context store. This allows low-level database hooks to access the tenant ID without changing our service method signatures, keeping our business logic clean and decoupled.

#### Q4: How is AsyncLocalStorage structured in WorkSphere?
**Answer**: We initialize a global storage context using `AsyncLocalStorage`. The `tenantMiddleware` intercepts requests, extracts the validated `companyId`, and calls `tenantStorage.run(companyId, next)`. Any code executed down that request chain (including database queries) can retrieve the active store context using `tenantStorage.getStore()`.

#### Q5: What happens when a background job (like a cron task) needs to run outside an HTTP request?
**Answer**: Background jobs don't have an incoming HTTP request context. To support this, our services and repositories allow passing an optional `companyId` parameter. If a manual `companyId` is provided, the database queries fall back to that ID instead of reading from `AsyncLocalStorage`, ensuring the queries remain scoped.

#### Q6: Explain your database indexing strategy. Why compound indexes?
**Answer**: Since every query includes the tenant ID, single-field indexes on fields like `email` or `employeeId` are inefficient. We use compound indexes with `companyId` as the prefix (e.g., `{ companyId: 1, email: 1 }`). This allows MongoDB to filter documents by tenant first before scanning for specific fields, speeding up queries.

#### Q7: How do you handle unique indexes in a multi-tenant collection?
**Answer**: Standard unique indexes (like `{ email: 1 }`) fail in multi-tenant systems because different organizations might register employees with the same email. To prevent conflicts, we use compound unique indexes: `{ companyId: 1, email: 1, isDeleted: 1 }`. This ensures uniqueness is only enforced *within* each organization.

#### Q8: How does the soft-delete plugin work under the hood?
**Answer**: The soft-delete plugin adds `isDeleted: Boolean` and `deletedAt: Date` fields to schemas. It registers pre-hooks on query methods (`find`, `findOne`, `countDocuments`, `findOneAndUpdate`) to automatically append `{ isDeleted: { $ne: true } }` to the filter criteria, hiding deleted documents from standard queries.

#### Q9: How do you query soft-deleted documents if you need to restore them?
**Answer**: The plugin adds custom helper methods, such as `findDeleted()`, to Mongoose models. These bypass the automatic query filter to retrieve deleted documents.

#### Q10: How do you handle data consistency when soft-deleting an employee?
**Answer**: We handle cascade deletions programmatically in the repository layer. When an employee is deleted, the repository runs a transaction to soft-delete their related `User` login account, disable their active `salaryStructure`, and cancel any pending `leaves` or `reimbursements` to prevent orphan references.

#### Q11: Why did you choose MongoDB over a SQL database like PostgreSQL?
**Answer**: MongoDB was selected for its schema flexibility. HR profiles vary significantly across organizations (e.g., different custom fields for addresses, emergency contacts, education, and work history). MongoDB stores this structured, nested data natively without requiring complex schema migrations or relational table joins.

#### Q12: How do you handle database migrations in this architecture?
**Answer**: We use the standard model approach. We write script files that use Mongoose models to update schema fields in batches. These scripts are run before deploying backend updates.

---

## 🔐 Section 2: Security & Session Management (Q13–Q25)

#### Q13: How is JWT authentication structured in WorkSphere?
**Answer**: We use double-token authentication. The client receives a short-lived `accessToken` (valid for 15 minutes) in JSON and a long-lived `refreshToken` (valid for 7 days) stored in a secure, HttpOnly cookie.

#### Q14: Why store the refresh token in an HttpOnly cookie instead of localStorage?
**Answer**: Storing tokens in `localStorage` makes them vulnerable to Cross-Site Scripting (XSS) attacks. If an attacker injects malicious JS into the app, they can read `localStorage`. Setting the cookie with the `httpOnly` flag blocks browser JavaScript from reading it, preventing token theft via XSS.

#### Q15: How does Refresh Token Rotation (RTR) protect sessions?
**Answer**: Refresh Token Rotation is a security measure where the server invalidates the old refresh token and issues a new one every time the client requests a new access token. This limits the lifetime of any single token and helps detect unauthorized reuse.

#### Q16: How do you prevent Cross-Site Request Forgery (CSRF) for HttpOnly cookies?
**Answer**: We use the `sameSite` cookie attribute:
- In production, we set `sameSite: 'none'` with `secure: true` to support cross-domain API calls from Vercel to Render.
- To prevent CSRF attacks, the API relies on the `Authorization: Bearer <Access_Token>` header for all mutations. Since browsers do not automatically send custom headers cross-origin, this header protects our protected endpoints.

#### Q17: What does the HTTP header X-Frame-Options do in Helmet?
**Answer**: Helmet sets `X-Frame-Options: SAMEORIGIN`. This tells the browser not to render the site inside an `<iframe>` on external websites, protecting the app from clickjacking attacks.

#### Q18: What is Cross-Origin Resource Sharing (CORS) and how is it configured?
**Answer**: CORS is a security mechanism that restricts web applications from making requests to a different domain than the one that served the page. We configure the CORS middleware on the server to only allow requests from our whitelisted frontend domains, with credentials allowed.

#### Q19: Why do you need standard rate limiting on your API?
**Answer**: Rate limiting protects the API from brute-force authentication attacks and resource exhaustion. We limit production clients to 100 requests per 15 minutes per IP.

#### Q20: How do you validate API request bodies?
**Answer**: We use **Zod** schema validation. The validation schema is defined at the feature level, and requests are parsed before hitting the controller:
```ts
const parsed = loginSchema.parse(req.body);
```
If validation fails, the middleware catches the error and returns a structured `400 Bad Request` response, preventing malformed data from reaching the service layer.

#### Q21: How do you protect passwords in the database?
**Answer**: We hash passwords using **bcryptjs** with a salt round of 10. We never store plain-text passwords.

#### Q22: Why is select: false configured on user password schemas?
**Answer**: In Mongoose, we configure the `password` field with `select: false` so it is excluded from query results by default. This prevents developers from accidentally exposing hashed passwords in user list APIs.

#### Q23: How does your RBAC middleware authorize requests?
**Answer**: We use a curried middleware wrapper `requirePermissions(allowedRoles)`. It extracts the user's role from `req.user` and checks if it's in the allowed list:
```ts
router.post('/payroll/runs', authenticateUser, requirePermissions(['Company Admin', 'HR']), createRun);
```

#### Q24: How does WorkSphere handle secret keys?
**Answer**: We store secret keys (JWT secrets, API keys, database credentials) in environment variables (`.env`). These are loaded into process context at runtime using `dotenv` and are never committed to version control.

#### Q25: How do you manage database connection errors during startup?
**Answer**: Our database connection utility catches connection errors and logs them. The server will continue running without an active database connection rather than crashing immediately. This prevents boot loops and allows developers to inspect connection issues.

---

## ⚡ Section 3: Frontend Engineering (Q26–Q38)

#### Q26: Why did you use TanStack React Query instead of Redux for caching data?
**Answer**: Redux is designed for global client-side state, such as theme settings, user sessions, or sidebar toggles. It is not optimized for caching server state. TanStack Query handles caching, background updates, request deduplication, and loading states out of the box, reducing the boilerplate code needed for API calls.

#### Q27: How does client caching improve performance?
**Answer**: When a user navigates between screens, TanStack Query serves cached data instantly while fetching fresh data in the background. This minimizes page load states and reduces the number of API requests sent to the server.

#### Q28: What is staleTime and cacheTime in TanStack Query?
**Answer**:
- `staleTime`: The duration (e.g., 5 minutes) that cached data is considered fresh. During this window, subsequent queries read from the cache without triggering a network request.
- `gcTime` (formerly `cacheTime`): The duration that inactive data is kept in memory before being garbage collected.

#### Q29: How do you manage global states like user sessions?
**Answer**: We use **Redux Toolkit** to manage user session state (auth token, user profile data) and global UI alerts.

#### Q30: Why choose React Hook Form over raw React state for forms?
**Answer**: Raw React state triggers a re-render of the entire component on every keystroke, which can cause performance issues in large forms. React Hook Form uses ref-based inputs, reducing re-renders to only when input validation state changes.

#### Q31: How do you handle form validation on the client?
**Answer**: We use Zod schemas with the React Hook Form resolver (`@hookform/resolvers/zod`). This guarantees that form inputs are validated against the same rules used on the backend before making an API call.

#### Q32: What is lazy loading and why is it used?
**Answer**: Lazy loading splits the frontend application bundle into smaller code chunks. We load heavy pages (such as the payroll management panel) dynamically using `React.lazy` and `React.Suspense` only when the user visits those routes, lowering the initial load size.

#### Q33: How do you ensure the app remains responsive during chunk loads?
**Answer**: We wrap lazy-loaded routes in a `React.Suspense` block with a loading fallback component (e.g., a progress spinner).

#### Q34: What is request deduplication in Axios?
**Answer**: Request deduplication is a mechanism that intercepts and merges identical pending API requests. If a component makes multiple requests for the same resource simultaneously, only one network request is sent, and the result is shared across all callers.

#### Q35: How does Axios token injection work?
**Answer**: We use an Axios request interceptor that automatically reads the JWT from the Redux store and attaches it as a Bearer token in the `Authorization` header of outgoing requests.

#### Q36: How do you handle expired tokens in Axios?
**Answer**: We use an Axios response interceptor. If an API request returns `401 Unauthorized`, the interceptor attempts to fetch a new access token using the refresh endpoint and retries the original request. If that fails, it logs the user out.

#### Q37: Why use TypeScript for frontend development?
**Answer**: TypeScript provides static typing, which catches syntax and type errors at compile time rather than runtime. It also improves developer productivity with autocomplete and code contract verification.

#### Q38: How do you manage responsive layouts?
**Answer**: We use **Tailwind CSS** with responsive design prefixes (e.g., `sm:`, `md:`, `lg:`).

---

## ⚙️ Section 4: Backend Engineering & Performance (Q39–Q50)

#### Q39: What is the benefit of using the Repository Pattern in a MERN stack?
**Answer**: The Repository Pattern isolates Mongoose query details from our business services. If we ever need to update our database logic, optimize queries, or write unit tests with database mocks, we only need to update the repository layer without touching our business logic.

#### Q40: How is business logic separated from HTTP details in WorkSphere?
**Answer**: Controllers only handle HTTP-specific tasks (reading headers, parsing parameters, formatting responses). All business logic is kept in services, which accept plain JS parameters and return clean objects, keeping them testable.

#### Q41: Explain the global error wrapper setup.
**Answer**: We wrap controller functions in an `asyncHandler` utility. This utility catches any thrown exceptions and forwards them to the Express error-handling middleware, keeping our controllers clean:
```ts
export const login = asyncHandler(async (req: Request, res: Response) => { ... });
```

#### Q42: What is the benefit of Daily Winston Log Rotation?
**Answer**: Production servers can crash if log files grow large enough to fill the disk. Winston's daily file rotation compresses and archives older logs, keeping logs organized and preventing disk space issues.

#### Q43: How do you log errors on platforms with read-only filesystems?
**Answer**: On cloud platforms like Render, we disable file logging and stream logs directly to standard output (`process.stdout`). The platform's native log collectors then capture and index these streams.

#### Q44: What are Mongoose Virtuals and how are they used?
**Answer**: Virtuals are document properties that can be read and written but are not persisted to MongoDB. We use them for computed properties, such as concatenating `firstName` and `lastName` into a virtual `fullName` property.

#### Q45: How does Mongoose pre-save validation protect data?
**Answer**: We use Mongoose pre-save hooks to compute fields (such as calculating `netSalary` in salary structures) before writing to the database, ensuring data consistency.

#### Q46: How does the AI HR Chatbot retrieve database context?
**Answer**: The chatbot route queries the database for the active tenant's context (e.g., active employees, leaves, holidays) and injects this data into the LLM system prompt, allowing the model to answer questions based on real-time database state.

#### Q47: Why do we use Multer memoryStorage instead of diskStorage?
**Answer**: Disk storage writes uploaded files to the server's local filesystem. This doesn't work on ephemeral cloud platforms like Render where the filesystem is reset on deployments. `memoryStorage` stores files in memory as buffer streams, allowing us to upload them directly to Cloudinary.

#### Q48: How do you handle heavy PDF generations (e.g., payslips) without blocking requests?
**Answer**: PDF generation can block the event loop. We offload heavy generation tasks to background queues or optimize them using stream-based generation libraries to return responses quickly.

#### Q49: How do you verify database state consistency in unit tests?
**Answer**: We run our test suite against a separate in-memory database (`mongodb-memory-server`) to ensure tests run in isolation and do not affect our production database.

#### Q50: How do you scale this architecture horizontally?
**Answer**:
- **Stateless Server**: Our Express API is stateless (sessions use JWTs, and media is stored in Cloudinary), allowing us to spin up multiple instances behind a load balancer.
- **WebSocket Scaling**: To scale WebSockets, we integrate a Redis adapter into Socket.io to sync events across multiple server instances.
- **Database Scaling**: We scale our database by upgrading our MongoDB Atlas cluster to use replica sets and sharding.
