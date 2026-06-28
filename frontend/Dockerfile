# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# =============================================================================
# Stage 2: Development image
# =============================================================================
FROM deps AS development

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# =============================================================================
# Stage 3: Builder (production build)
# =============================================================================
FROM deps AS builder

COPY . .

RUN npm run build

# =============================================================================
# Stage 4: Production image (nginx serving static files)
# =============================================================================
FROM nginx:1.25-alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
