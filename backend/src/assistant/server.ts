import { resolve } from "node:path";
import { AssistantService } from "./service.ts";
import { createAssistantServer } from "./http.ts";
import { createInquirySender, deliverNextInquiry } from "./notifications.ts";
const notificationUrl = process.env.NDP_INQUIRY_FORM_URL ?? "";
if (process.env.NDP_REQUIRE_NOTIFICATIONS === "true" && !notificationUrl)
  throw new Error("inquiry_notifications_required");
const sendInquiry = notificationUrl
  ? createInquirySender(notificationUrl)
  : undefined;
const root = resolve(process.env.NDP_ASSISTANT_DATA_DIR ?? ".private-chatbot");
const service = new AssistantService(
  root,
  process.env.OPENAI_API_KEY ?? "",
  undefined,
  Date.now,
  Boolean(sendInquiry),
);
const origins = (
  process.env.NDP_ASSISTANT_ORIGINS ??
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((s) => s.trim());
await service.store.purge(Date.now());
const server = createAssistantServer(service, origins);
// Private by default. An approved HTTPS gateway is required for a public release.
const host =
  process.env.NDP_ASSISTANT_HOST === "0.0.0.0" ? "0.0.0.0" : "127.0.0.1";
server.listen(Number(process.env.NDP_ASSISTANT_PORT ?? 8787), host, () =>
  console.log(
    "Netherwood assistant listening on",
    host,
    server.address() && typeof server.address() === "object"
      ? (server.address() as { port: number }).port
      : "unknown",
  ),
);
const maintenance = setInterval(() => {
  void service.store.purge(Date.now()).catch(() => undefined);
}, 3600_000).unref();
let notificationBusy = false;
const notifications = setInterval(() => {
  if (!sendInquiry || notificationBusy) return;
  notificationBusy = true;
  void deliverNextInquiry(service.store, sendInquiry)
    .then((result) => {
      if (result === "failed")
        console.error("Inquiry notification delivery needs owner review.");
    })
    .catch(() => undefined)
    .finally(() => {
      notificationBusy = false;
    });
}, 15_000).unref();
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    clearInterval(maintenance);
    clearInterval(notifications);
    server.close();
  });
