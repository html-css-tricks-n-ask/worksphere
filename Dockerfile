# ─── Stage 1: Build Client ──────────────────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# ─── Stage 2: Production Image ──────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy production backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --only=production

# Copy native backend code
COPY server/src ./server/src

# Copy compiled client code to server public folder
COPY --from=client-builder /app/client/dist ./server/src/public

# Expose backend port
EXPOSE 5002

# Set Environment variables
ENV NODE_ENV=production
ENV PORT=5002

# Run production server directly
CMD ["node", "server/src/server.js"]
