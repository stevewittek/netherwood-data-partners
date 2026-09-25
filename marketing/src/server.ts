import { existsSync } from 'node:fs';
import { loadConfig } from './config.ts';
import { MarketingStore } from './store.ts';
import { LocalEmailProvider } from './provider.ts';
import { CampaignService } from './campaigns.ts';
import { createMarketingServer } from './http.ts';

if (existsSync('.env')) process.loadEnvFile('.env');
const config = loadConfig();
const store = new MarketingStore(config.dbPath);
const provider = new LocalEmailProvider(config.outboxDir);
const campaigns = new CampaignService(store, provider, config);
const server = createMarketingServer({ store, campaigns, config });
server.listen(config.port, '127.0.0.1', () => {
  process.stdout.write('Netherwood marketing desk: ' + config.origin + '\nLOCAL SIMULATION — no email is sent.\n');
});
let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(() => { store.close(); process.exitCode = 0; });
  server.closeIdleConnections();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
server.on('error', () => {
  process.stderr.write('The marketing desk could not start. Check the port and local configuration.\n');
  store.close();
  process.exitCode = 1;
});
