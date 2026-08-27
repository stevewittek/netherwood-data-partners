FROM node:22.13.1-bookworm-slim AS tested
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY src ./src
COPY test ./test
COPY sql ./sql
COPY tsconfig.json ./
RUN npm test && npm run typecheck && npm prune --omit=dev

FROM node:22.13.1-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=tested --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=tested --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node src ./src
USER node
EXPOSE 3000
CMD ["node", "--experimental-strip-types", "src/server.ts"]
