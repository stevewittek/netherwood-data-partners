FROM node:22.13.1-bookworm-slim@sha256:83fdfa2a4de32d7f8d79829ea259bd6a4821f8b2d123204ac467fbe3966450fc
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=node:node package.json ./package.json
# Runtime uses only Node built-ins. No SQL client, admin tooling or repository mount.
COPY --chown=node:node src/assistant/http.ts src/assistant/knowledge.ts src/assistant/notifications.ts src/assistant/provider.ts src/assistant/scope.ts src/assistant/server.ts src/assistant/service.ts src/assistant/store.ts ./src/assistant/
USER node
CMD ["node", "--env-file=/run/secrets/runtime.env", "--experimental-strip-types", "src/assistant/server.ts"]
