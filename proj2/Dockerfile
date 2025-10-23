# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from the 'frontend' subdirectory
COPY frontend/package.json ./
COPY frontend/pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy source code from the 'frontend' subdirectory
COPY frontend/ .

# Build the Next.js app
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files from the 'frontend' subdirectory
COPY frontend/package.json ./
COPY frontend/pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod

# Copy built app from the builder stage (these paths don't change)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the app
CMD ["pnpm", "start"]