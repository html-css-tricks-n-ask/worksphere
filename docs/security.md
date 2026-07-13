# Security Architecture & Policies

This document outlines the security architecture, data protection rules, defense mechanisms, and standards implemented in **WorkSphere**.

---

## 🔐 1. JWT Security & Refresh Token Rotation (RTR)

To reduce the risk of token theft, sessions use a short-lived access token paired with a long-lived refresh token.

```
                  ┌──────────────────────┐
                  │  JWT Authentication  │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [Access Token]                    [Refresh Token]
   - JSON Payload                    - Encoded Securely
   - Validity: 15 minutes            - Validity: 7 days
   - Sent in: Bearer Header          - Sent in: HttpOnly Cookie
                                     - Scope: /api/v1/auth/refresh
```

### Cookie Hardening Configuration
Refresh tokens are set on the client via server-side cookies, making them inaccessible to client-side scripts:
- **`httpOnly: true`**: Blocks all XSS (cross-site scripting) attempts to access cookies via `document.cookie`.
- **`secure: true`**: Guarantees the cookie is only transmitted over encrypted HTTPS channels (enforced in production).
- **`sameSite: 'lax' / 'none'`**: Restricts cookie transmission across domains. In production, CORS uses `sameSite: 'none'` with `secure: true` to support cross-domain API calls from Vercel.
- **`path: '/api/v1/auth'`**: Ensures the browser only sends the refresh cookie during token rotation requests, minimizing exposure.

---

## 🚪 2. Role-Based Access Control (RBAC)

API authorization is enforced using permission gates at the route layer. The backend maps users to specific roles (`Super Admin`, `Company Admin`, `HR`, `Manager`, `Employee`).

### Express Guard Implementation
The authorization middleware checks the user's role:
```ts
export const requirePermissions = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'User is not authenticated.');
    }
    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }
    next();
  };
};
```

### Authorization Matrix

| Feature Module | Endpoint | Super Admin | Company Admin | HR | Manager | Employee |
|---|---|---|---|---|---|---|
| Register Org | `POST /auth/register` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Employee | `POST /employees` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Payroll | `POST /payroll/runs` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Leaves | `PATCH /leaves/:id/status`| ✅ | ✅ | ✅ | ✅ | ❌ |
| Request Leaves | `POST /leaves` | ✅ | ✅ | ✅ | ✅ | ✅ |
| System Settings | `PUT /settings` | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🛠️ 3. Request Verification & Input Sanitization

To protect the server from SQL/NoSQL injection attacks and malformed payloads, schemas validate incoming data before execution.

- **Zod Schema Parsing**: Controllers run inputs through strict type validators, stripping out unmapped keys:
  ```ts
  export const loginSchema = z.object({
    email: z.string().email('Invalid email address format.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
  });
  ```
- **MongoDB Query Injection Prevention**: Mongoose strictly enforces schema structures. Unmapped fields in query parameters are ignored, preventing SQL/NoSQL injections.

---

## 🛡️ 4. HTTP Headers Protection & CORS Policy

### 1. Helmet integration
The app integrates **Helmet** to set secure HTTP headers, protecting against clickjacking, sniff attacks, and cross-site scripting:
- `X-Frame-Options: SAMEORIGIN` (prevents framing/clickjacking).
- `X-Content-Type-Options: nosniff` (forces browsers to respect declared content-types).
- `Content-Security-Policy` configurations.

### 2. CORS (Cross-Origin Resource Sharing)
Access permissions are strictly limited to verified client hosts:
```ts
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://worksphere-eeui.vercel.app',
  'https://worksphere-7421.vercel.app',
];
```
In production, credentials transfer (`withCredentials: true`) is only permitted for origins matching this whitelist.

---

## ⏳ 5. Rate Limiting Protection

To protect the API from brute-force authentication attempts and denial-of-service (DoS) attacks, the app uses rate limiting:

```ts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use('/api', limiter);
```
- **Production Limit**: 100 requests per 15 minutes per IP.
- **Development Limit**: Relaxed to 10,000 requests per 15 minutes to support Hot Module Replacement (HMR) traffic.
