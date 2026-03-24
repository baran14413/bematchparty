# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npx expo export --platform web

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Install 'serve' globally
RUN npm install -g serve

# Copy ONLY the exported static files from builder
COPY --from=builder /app/dist ./dist

# Expose Cloud Run port
EXPOSE 8080

# Serve the static files
CMD ["serve", "-s", "dist", "-l", "8080"]
