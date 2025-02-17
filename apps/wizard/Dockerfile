FROM node:20-alpine AS base

RUN apk add --no-cache npm
RUN npm install -g pnpm@latest

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /repo/
COPY --from=root pnpm-lock.yaml .
COPY --from=root package.json .
COPY --from=root pnpm-workspace.yaml .
COPY --from=root packages/common/package.json packages/common/package.json
COPY --from=root ./apps/wizard/package.json apps/wizard/package.json

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /repo
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# # Rebuild the source code only when needed
FROM base AS builder
WORKDIR /repo/
COPY --from=root packages/common packages/common
COPY --from=root ./apps/wizard apps/wizard



COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/wizard/node_modules ./apps/wizard/node_modules
COPY --from=deps /repo/packages/common/node_modules ./packages/common/node_modules

WORKDIR /repo/apps/wizard
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# Production image, copy all the files and serve with nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from builder stage
COPY --from=builder /repo/apps/wizard/dist/wizard ./

# Copy custom nginx configuration
# COPY --from=root /path/to/your/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]