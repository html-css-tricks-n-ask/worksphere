# Cloud Services Integration

This document outlines the cloud infrastructure topology and explains why each service was selected for **WorkSphere**.

---

## ☁️ 1. Infrastructure Topology

WorkSphere distributes application operations, storage, and networking across specialized cloud providers to optimize performance and cost:

```
                          ┌──────────────────────┐
                          │    Browser Client    │
                          └──────────┬───────────┘
                                     │
                             ┌───────┴───────┐
                             ▼               ▼
                       [Vercel CDN]    [Render Web]
                       (Frontend SPA)  (Express API)
                                             │
               ┌────────────────┬────────────┴───┬──────────────┐
               ▼                ▼                ▼              ▼
        [MongoDB Atlas]   [Cloudinary]     [Gmail SMTP]      [GitHub]
       (Transactional DB) (Media/Assets)   (Email Delivery)  (CI/CD)
```

---

## 🗄️ 2. Database Layer: MongoDB Atlas

**MongoDB Atlas** was selected as the managed database layer for WorkSphere's transactional storage.

- **Why MongoDB?**
  - **Dynamic Schema**: Multi-tenant systems require flexible document schemas. For example, different companies may request custom fields in employee profiles, experience logs, or emergency details. Relational schemas would require complex migrations; MongoDB handles this natively via nested documents.
  - **JSON Integration**: MongoDB stores documents as BSON, matching the Express backend and React frontend JSON structures, which simplifies serialization.
- **Atlas Features Used**:
  - **Connection Pooling**: Reuses database socket connections to handle high API traffic.
  - **Automatic Indexing**: Automatically optimizes queries based on compound index keys (e.g., `{ companyId: 1, email: 1 }`).

---

## 🖼️ 3. Media CDN: Cloudinary

**Cloudinary** is used as the storage engine for all system media (logos, profile photos, reimbursement receipts).

- **Why Cloudinary?**
  - **Decoupled Application State**: Express containers are ephemeral; files saved to local disk are lost when the container restarts. Saving attachments directly to Cloudinary ensures they persist.
  - **Automatic Optimization**: Cloudinary automatically compresses images and serves them in modern web formats (like WebP) with optimal resolution tags based on client device profiles, reducing bandwidth consumption.
  - **Transformation API**: We retrieve user photos dynamically using on-the-fly transformations (e.g. `c_fill,g_face,w_150,h_150` for avatars).

---

## 🐳 4. API hosting: Render

**Render** hosts the Express backend API.

- **Why Render?**
  - **Native Node.js Runtime Support**: Render compiles TypeScript code and runs the Node server process directly.
  - **Docker Engine Support**: Standardizes runtime execution across local development and production environments using our `/Dockerfile`.
  - **Health Monitoring**: Automatically restarts stalled processes if health checks fail.

---

## ⚡ 5. Client CDN hosting: Vercel

**Vercel** hosts the static frontend build.

- **Why Vercel?**
  - **Global CDN Edge Edge**: Delivers JS/HTML bundles directly to edge networks close to users, reducing initial load times.
  - **Automatic Redeploys**: Hooks directly into the GitHub repository to trigger builds and deployments automatically on code pushes.
  - **SPA fallback**: Handles client-side routing, redirecting wildcard paths directly to `index.html` so React Router can process URLs.

---

## 📧 6. Notifications: SMTP Server (Mailtrap / Gmail)

**SMTP** is used for sending system emails (registration verification, reset links, salary slips).

- **Why SMTP?**
  - **Transactional Alerts**: Email is essential for HR flows like onboarding notifications and password resets.
  - **Testing Isolation**: Integrates with Mailtrap in development to test email flows safely, and transitions to Gmail SMTP/SendGrid in production.
