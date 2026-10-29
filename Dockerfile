# syntax=docker/dockerfile:1
# Multi-stage build: compile with dev dependencies, ship only the standalone server.

FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Static pages bake these in at build time (share-image URLs and the attribution link), so pass them as build args
ARG PUBLIC_ORIGIN=http://localhost:3000
ARG TTC_URL=
ENV PUBLIC_ORIGIN=$PUBLIC_ORIGIN TTC_URL=$TTC_URL NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 DATABASE_PATH=/data/nextile.db NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/scripts/backup-db.mjs ./scripts/backup-db.mjs
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=60s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
