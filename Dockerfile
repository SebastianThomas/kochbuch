# --- build the Vue PWA -----------------------------------------------------
FROM node:24-slim AS vue-build
WORKDIR /frontend-src
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# --- server runtime ------------------------------------------------------
FROM node:24-slim AS kochbuch-server

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV PORT=5000
WORKDIR /app

# Install only runtime deps; the server reads its dependencies from the root
# package.json (there is no server/package.json).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./server
COPY --from=vue-build /frontend-src/dist/ ./server/public

EXPOSE 5000
USER node
CMD ["npm", "start"]
