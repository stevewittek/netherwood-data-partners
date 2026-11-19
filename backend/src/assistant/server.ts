import { resolve } from "node:path";
import { AssistantService } from "./service.ts";
import { createAssistantServer } from "./http.ts";
const root = resolve(process.env.NDP_ASSISTANT_DATA_DIR ?? ".private-chatbot");
const service = new AssistantService(root, process.env.OPENAI_API_KEY ?? "");
const origins = (
  process.env.NDP_ASSISTANT_ORIGINS ??
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((s) => s.trim());
await service.store.purge(Date.now());
const server = createAssistantServer(service, origins);
// Private by default. An approved HTTPS gateway is required for a public release.
server.listen(Number(process.env.NDP_ASSISTANT_PORT ?? 8787), "127.0.0.1", () =>
  console.log(
    "Netherwood assistant listening on loopback port",
    server.address() && typeof server.address() === "object"
      ? (server.address() as { port: number }).port
      : "unknown",
  ),
);
const maintenance = setInterval(() => {
  void service.store.purge(Date.now()).catch(() => undefined);
}, 3600_000).unref();
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    clearInterval(maintenance);
    server.close();
  });
