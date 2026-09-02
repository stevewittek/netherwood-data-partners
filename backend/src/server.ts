import { createApp } from "./app.ts";
const host = process.env.HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error("PORT must be an integer from 1 through 65535");
const server = createApp();
server.listen(port, host, () => console.log(JSON.stringify({ event: "server_started", host, port })));
function shutdown(signal: string): void {
  console.log(JSON.stringify({ event: "server_stopping", signal }));
  server.close((error) => {
    if (error) {
      console.error(JSON.stringify({ event: "server_stop_failed", errorType: error.name }));
      process.exitCode = 1;
    }
  });
  setTimeout(() => server.closeAllConnections(), 10_000).unref();
}
process.once("SIGINT", () => shutdown("SIGINT")); process.once("SIGTERM", () => shutdown("SIGTERM"));
