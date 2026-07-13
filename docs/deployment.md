# Deployment & Orchestration Guide

This document details the deployment pipeline, Docker configuration, and cloud hosting architecture for **WorkSphere**.

---

## 🏗️ 1. Multi-Stage Production Docker Configuration

To optimize production builds, the repository uses a multi-stage Docker build process. This separates the build environment from the lean runtime container, keeping the final production image under 200MB.

### The Production Dockerfile (`/Dockerfile` at workspace root)

```dockerfile
# ─── Stage 1: Build Client React App ──────────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# ─── Stage 2: Build Server Express App ─────────────────────────────────────────
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# ─── Stage 3: Clean Production Runtime ───────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy production backend dependencies only (avoids devDependencies bloat)
COPY server/package*.json ./server/
RUN cd server && npm install --only=production

# Copy compiled backend code
COPY --from=server-builder /app/server/dist ./server/dist

# Copy compiled client code to server public folder
COPY --from=client-builder /app/client/dist ./server/dist/public

# Expose backend port
EXPOSE 5002

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5002

# Run production server
CMD ["node", "server/dist/server.js"]
```

---

## 🐳 2. Production Docker Compose Configuration

The system uses `docker-compose` to run the application and database containers on a bridge network.

```yaml
version: '3.8'

services:
  database:
    image: mongo:6.0
    container_name: worksphere-db
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - worksphere-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: worksphere-app
    ports:
      - "5002:5002"
    environment:
      - PORT=5002
      - NODE_ENV=production
      - MONGO_URI=mongodb://database:27017/worksphere
      - JWT_SECRET=production_secret_key_change_me_in_prod
      - JWT_REFRESH_SECRET=production_refresh_secret_key_change_me_in_prod
    depends_on:
      database:
        condition: service_healthy
    networks:
      - worksphere-network

volumes:
  mongo-data:

networks:
  worksphere-network:
    driver: bridge
```

---

## 🌐 3. Cloud Environments Topology

For scalable cloud hosting, WorkSphere splits frontend assets from API runtime processing:

```
[Browser Client]
   │
   ├──► Static Web assets / CSS / JS / Images
   │    Hosted on Vercel CDN Edge
   │
   └──► Secure API / WebSocket requests
        Routed to Render.com Web Service
           │
           ├─► Scoped Data Storage ➔ MongoDB Atlas
           ├─► File Storage ➔ Cloudinary CDN
           └─► Alerts delivery ➔ SMTP Server
```

### 1. Frontend: Vercel Hosting
- **Build Settings**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://worksphere-server-3077.onrender.com/api/v1`

### 2. Backend: Render Web Service
- **Build Settings**:
  - Build Command: `cd server && npm install && npm run build`
  - Start Command: `cd server && npm start`
- **Required Production Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `5000` (Render maps this to port 443 automatically)
  - `MONGO_URI`: `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/worksphere`
  - `JWT_SECRET`: `secure_long_random_hash_string`
  - `JWT_REFRESH_SECRET`: `another_secure_long_random_hash_string`
  - `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`
  - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
