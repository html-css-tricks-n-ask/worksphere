# LinkedIn Portfolio Showcase

This document contains a professional LinkedIn project post designed to highlight the system architecture, challenges solved, and technology stack of **WorkSphere** to recruiters and engineering managers.

---

## 📝 LinkedIn Post Template

**Copy and paste the template below to share your project on LinkedIn:**

---

🚀 I just completed **WorkSphere**, a production-ready, multi-tenant Employee Management & HRMS SaaS platform! 

Built with the **MERN Stack** (MongoDB Atlas, Express, React, Node) and **JavaScript**, WorkSphere is designed to demonstrate enterprise-level frontend and backend architecture.

Here is a breakdown of the system design and implementation details:

### 🏛️ Core System Architecture
1. **Multi-Tenant Data Isolation**: Implemented a shared-database, scoped-document architecture. Using Node's `AsyncLocalStorage` and Mongoose query middleware, tenant context (`companyId`) is automatically injected into all query filters out-of-band, preventing data leaks.
2. **Clean Architecture Boundary**: Followed a strict Controller-Service-Repository pattern. Decoupled Express HTTP controllers from core domain services and repositories to ensure database queries are isolated, easing testing and code maintenance.
3. **Double Token Session Security**: Implemented Refresh Token Rotation (RTR). Access tokens are short-lived, while refresh tokens are stored in secure, HttpOnly, SameSite cookies to protect against XSS and CSRF attacks.
4. **Context-iare AI HR Assistant**: Built an AI chatbot that queries the active tenant's database context (active employee counts, leave trends, department salaries) and injects it into LLM prompts to answer user questions based on live database state.

### 🛠️ Technical Implementation Details
- **Frontend State domains**: Managed client state using **Redux Toolkit** (auth tokens, global UI state) and **TanStack React Query v5** (server state caching, window re-focus sync, optimistic UI updates).
- **Media Optimization Pipeline**: Streamed image uploads (company logos, reimbursement receipts) to **Cloudinary** using **Multer** in-memory storage, decoupling static assets from ephemeral server filesystems.
- **Transactional Alerts**: Integrated **Nodemailer SMTP** (configured via Mailtrap/Gmail) to send account verification links, password reset links, and monthly payslips.
- **Dockerized Deployments**: Created multi-stage Docker builds to keep production image sizes under 200MB, orchestration managed via Docker Compose.

### 💡 Challenges Solved
- **Preventing Tenant Data Leaks**: Solved by implementing global Mongoose query interceptors to automate tenant scoping instead of relying on developers to manually write filters.
- **Handling Ephemeral Filesystems in Serverless/PaaS**: Replaced local file storage with a memory-stream pipeline that uploads files directly to Cloudinary, ensuring assets persist when server instances spin down.
- **Mitigating Render.com Cold Start Timeouts**: Fixed by raising client-side Axios timeouts to 60s and updating request hooks to show a "server warming up" state on network timeouts instead of a generic "invalid credentials" error.

This project demonstrated the importance of proper system design, decoupled state management, and clear architecture boundaries in building scalable SaaS platforms.

Check out the full repository and architecture documentation below! 👇

🔗 **GitHub Repository**: [Your GitHub Link Here]
🔗 **Live Project URL**: [Your Live Vercel Link Here]

#systemdesign #webdevelopment #mernstack #javascript #js #softwareengineering #reactjs #nodejs #mongodb #saas #programming
