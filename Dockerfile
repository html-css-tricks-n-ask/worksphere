# ─── Stage 1: Build Client ──────────────────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# ─── Stage 2: Build Server ──────────────────────────────────────────────────
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# ─── Stage 3: Production Image ──────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy production backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --only=production

# Copy compiled backend code
COPY --from=server-builder /app/server/dist ./server/dist

# Copy compiled client code to server public folder
COPY --from=client-builder /app/client/dist ./server/dist/public

# Expose backend port
EXPOSE 5002

# Set Environment variables
ENV NODE_ENV=production
ENV PORT=5002

# Run production server
CMD ["node", "server/dist/server.js"]
