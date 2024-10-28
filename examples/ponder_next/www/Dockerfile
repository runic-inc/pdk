FROM node:18-alpine

RUN apk add --no-cache libc6-compat
RUN apk update

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files (for workspace dependencies)
# COPY ponder/package.json ponder/
COPY www/package.json www/
# Add other workspace package.json files as needed

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy the rest of the workspace
COPY . .

WORKDIR /app/www

CMD ["pnpm", "dev"]