FROM node:18-alpine
RUN apk add --no-cache libc6-compat python3 py3-pip make g++ gcc
RUN apk update
RUN ln -sf python3 /usr/bin/python

# Install pnpm using npm instead of corepack
RUN npm install -g pnpm

WORKDIR /app
# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy all package.json files (for workspace dependencies)
COPY ponder/package.json ponder/
# COPY www/package.json www/
# Add other workspace package.json files as needed

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy the rest of the workspace
COPY . .
WORKDIR /app/ponder
CMD ["pnpm", "dev"]