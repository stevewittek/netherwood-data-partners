import assert from 'node:assert/strict';
import test from 'node:test';
import { request } from 'node:http';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { MarketingStore } from '../src/store.ts';
import { CampaignService } from '../src/campaigns.ts';
import { LocalEmailProvider } from '../src/provider.ts';
import { createMarketingServer } from '../src/http.ts';
import type { MarketingConfig } from '../src/config.ts';

async function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'nwd-marketing-http-'));
  const config: MarketingConfig = {
    adminToken: 'synthetic-admin-token-for-http-testing-123456',
    attributionToken: 'synthetic-attribution-token-testing-123456',
    dbPath: ':memory:', outboxDir: join(directory, 'outbox'), port: 4310, mode: 'local',
    origin: 'http://127.0.0.1:4310', publicBaseUrl: 'http://127.0.0.1:4310',
    websiteOrigin: 'https://example.test', senderName: 'Netherwood TEST', senderEmail: 'sender@example.test',
    testRecipient: 'owner@example.test', postalAddress: 'SYNTHETIC LOCAL TEST ADDRESS',
  };
  const store = new MarketingStore(':memory:');
  const campaigns = new CampaignService(store, new LocalEmailProvider(config.outboxDir), config);
  const server = createMarketingServer({ store, campaigns, config });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const port = address.port;
  function call(path: string, options: {method?:string;body?:unknown;raw?:string;headers?:Record<string,string>;auth?:boolean} = {}) {
    const method = options.method || 'GET';
    const payload = options.raw ?? (options.body !== undefined ? JSON.stringify(options.body) : '');
    const headers: Record<string,string> = {
      Host: '127.0.0.1:4310',
      ...(payload ? {'Content-Length':String(Buffer.byteLength(payload))} : {}),
      ...(options.auth === false ? {} : {Authorization:'Bearer ' + config.adminToken}),
      ...(options.body !== undefined || options.raw !== undefined ? {'Content-Type':'application/json',Origin:config.origin,'X-Marketing-Request':'1'} : {}),
      ...options.headers,
    };
    return new Promise<{status:number;body:string;headers:Record<string,unknown>;json:()=>Record<string,unknown>}>((resolve, reject) => {
      const req = request({hostname:'127.0.0.1',port,path,method,headers}, res => {
        let body = ''; res.setEncoding('utf8'); res.on('data', chunk => {body += chunk;});
        res.on('end', () => resolve({status:res.statusCode!,body,headers:res.headers,json:()=>JSON.parse(body)}));
      });
      req.on('error', reject); req.end(payload);
    });
  }
  async function close() {
    await new Promise<void>(resolve => server.close(() => resolve()));
    store.close(); rmSync(directory, { recursive: true, force: true });
  }
  return {call,close,config,store,campaigns,directory};
}
test('private API requires bearer authorization and rejects foreign hosts/origins', async () => {
  const f = await fixture();
  try {
    assert.equal((await f.call('/api/lists',{auth:false})).status,401);
    assert.equal((await f.call('/api/lists',{headers:{Authorization:'Bearer wrong'}})).status,401);
    assert.equal((await f.call('/api/lists',{headers:{Host:'attacker.example'}})).status,421);
    assert.equal((await f.call('/api/lists',{headers:{Origin:'https://attacker.example'}})).status,403);
    assert.equal((await f.call('/api/lists',{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
    const shell = await f.call('/',{auth:false});
    assert.equal(shell.status,200); assert.ok(!shell.body.includes(f.config.adminToken));
    assert.equal(shell.headers['cache-control'],'no-store');
    assert.ok(String(shell.headers['content-security-policy']).includes("frame-ancestors 'none'"));
    assert.equal(shell.headers['access-control-allow-origin'],undefined);
    assert.equal(shell.headers['set-cookie'],undefined);
    assert.equal((await f.call('/api/lists')).status,200);
  } finally {await f.close();}
});
test('mutations require same origin, a custom header, JSON, and a bounded body', async () => {
  const f = await fixture();
  try {
    const path = '/api/lists';
    assert.equal((await f.call(path,{method:'POST',body:{name:'TEST'},headers:{Origin:''}})).status,403);
    assert.equal((await f.call(path,{method:'POST',body:{name:'TEST'},headers:{'X-Marketing-Request':''}})).status,403);
    assert.equal((await f.call(path,{method:'POST',body:{name:'TEST'},headers:{'Content-Type':'text/plain'}})).status,415);
    assert.equal((await f.call(path,{method:'POST',raw:'{"name":'})).status,400);
    assert.equal((await f.call(path,{method:'POST',body:['TEST']})).status,400);
    assert.equal((await f.call(path,{method:'POST',body:{name:'TEST'},headers:{'Content-Length':'3000000'}})).status,413);
    assert.equal(f.store.listLists().length,0);
    assert.equal((await f.call(path,{method:'POST',body:{name:'Synthetic TEST list'}})).status,201);
  } finally {await f.close();}
});
test('CSV preview is read only and invalid import is rejected without partial rows', async () => {
  const f = await fixture();
  try {
    const list = f.store.createList('CSV TEST');
    const payload = {csv:'Business,Email\nGarden TEST,info@garden.example.test\nInvalid TEST,bad-email',mapping:{company_name:'Business',general_public_email:'Email'},source:'Synthetic test fixture'};
    const preview = await f.call('/api/import/preview',{method:'POST',body:payload});
    assert.equal(preview.status,200); assert.equal(preview.json().invalid_count,1);
    assert.equal(f.store.listCompanies(list.id).length,0);
    assert.equal((await f.call('/api/lists/' + list.id + '/import',{method:'POST',body:payload})).status,400);
    assert.equal(f.store.listCompanies(list.id).length,0);
    assert.equal((await f.call('/api/lists/' + list.id + '/import',{method:'POST',body:{...payload,skipInvalid:true}})).status,200);
    assert.equal(f.store.listCompanies(list.id).length,1);
    const malformed = await f.call('/api/import/preview',{method:'POST',body:{...payload,csv:'Business,Email\n"unclosed,email@example.test'}});
    assert.equal(malformed.status,400); assert.match(String(malformed.json().error),/CSV|quoted|quote/i);
    assert.equal(f.store.listCompanies(list.id).length,1);
  } finally {await f.close();}
});
test('suppression survives a working-list deletion and a fresh import through HTTP', async () => {
  const f = await fixture();
  try {
    const list = f.store.createList('First TEST');
    const payload = {csv:'Name,Email\nGarden TEST,info@garden.example.test',mapping:{company_name:'Name',general_public_email:'Email'},source:'Synthetic fixture'};
    await f.call('/api/lists/' + list.id + '/import',{method:'POST',body:payload});
    assert.equal((await f.call('/api/suppression',{method:'POST',body:{email:'INFO@GARDEN.EXAMPLE.TEST',reason:'unsubscribe',source:'Synthetic recipient request'}})).status,201);
    assert.equal((await f.call('/api/lists/' + list.id,{method:'DELETE',body:{confirmation:'DELETE'}})).status,200);
    const replacement = f.store.createList('Second TEST');
    const imported = await f.call('/api/lists/' + replacement.id + '/import',{method:'POST',body:payload});
    assert.equal(imported.status,200); assert.equal(imported.json().suppressed,1);
    assert.equal(f.store.eligibleCompanies(replacement.id).length,0);
    assert.equal((await f.call('/api/suppression',{method:'DELETE',body:{}})).status,404);
    assert.equal((await f.call('/api/suppression/reinstate',{method:'POST',body:{email:'info@garden.example.test',evidence:'Explicit permission documented in synthetic fixture'}})).status,400);
    assert.ok(f.store.isSuppressed('info@garden.example.test'));
  } finally {await f.close();}
});
test('production is blocked; local workflow creates files; GET unsubscribe never opts out', async () => {
  const f = await fixture();
  try {
    const list = f.store.createList('Email TEST');
    f.store.addCompany(list.id,{company_name:'Garden Machine TEST',general_public_email:'info@garden.example.test',city:'Test Town'},'Synthetic fixture','');
    const draft = await f.call('/api/campaigns',{method:'POST',body:{name:'Migration TEST',channel:'email',list_id:list.id,landing_page:'/',template:'data_migration'}});
    assert.equal(draft.status,201);
    const id = draft.json().id;
    const path = '/api/campaigns/' + id;
    assert.equal((await f.call(path + '/send',{method:'POST',body:{recipientCount:1,confirmation:'SEND',production:true}})).status,400);
    assert.equal((await f.call(path + '/preview',{method:'POST',body:{}})).json().recipientCount,1);
    assert.equal((await f.call(path + '/test',{method:'POST',body:{}})).status,200);
    assert.equal((await f.call(path + '/ready',{method:'POST',body:{}})).status,200);
    assert.equal((await f.call(path + '/approve',{method:'POST',body:{recipientCount:2,confirmation:'APPROVE'}})).status,400);
    assert.equal((await f.call(path + '/approve',{method:'POST',body:{recipientCount:1,confirmation:'APPROVE'}})).status,200);
    assert.equal((await f.call(path + '/send',{method:'POST',body:{recipientCount:1,confirmation:'SEND'}})).status,200);
    const messageFile = readdirSync(f.config.outboxDir).filter(name=>name.endsWith('.json')).map(name=>JSON.parse(readFileSync(join(f.config.outboxDir,name),'utf8'))).find(item=>item.message.test===false);
    const token = new URL(messageFile.message.unsubscribeUrl).pathname.split('/').at(-1);
    assert.ok(token,'Local message includes an opaque unsubscribe token');
    const unsubscribePath = '/unsubscribe/' + token;
    assert.equal((await f.call(unsubscribePath,{auth:false})).status,200);
    assert.equal(f.store.isSuppressed('info@garden.example.test'),false);
    assert.equal((await f.call(unsubscribePath,{method:'POST',auth:false,raw:'confirm=no',headers:{'Content-Type':'application/x-www-form-urlencoded'}})).status,400);
    const oneClick = await f.call(unsubscribePath,{method:'POST',auth:false,raw:'List-Unsubscribe=One-Click',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:''}});
    assert.equal(oneClick.status,200); assert.match(oneClick.body,/You have been unsubscribed/);
    assert.ok(f.store.isSuppressed('info@garden.example.test'));
    assert.equal((await f.call(unsubscribePath,{method:'POST',auth:false,raw:'List-Unsubscribe=One-Click',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:''}})).status,200);
    const results = (await f.call('/api/results')).json() as unknown as {delivered:number;simulated:number}[];
    assert.equal(results[0].delivered,0); assert.equal(results[0].simulated,1);
  } finally {await f.close();}
});
test('attribution secret is separate from admin and browser events are refused', async () => {
  const f = await fixture();
  try {
    const path = '/api/attribution/events';
    assert.equal((await f.call(path,{method:'POST',body:{},headers:{Origin:''}})).status,401);
    assert.equal((await f.call(path,{method:'POST',body:{},headers:{Authorization:'Bearer '+f.config.attributionToken}})).status,403);
    assert.equal((await f.call(path,{method:'POST',body:{},headers:{Origin:'',Authorization:'Bearer '+f.config.attributionToken}})).status,400);
    assert.equal((await f.call('/api/lists',{headers:{Authorization:'Bearer '+f.config.attributionToken}})).status,401);
    assert.equal((await f.call('/r/' + 'x'.repeat(43),{auth:false})).status,400);
    assert.equal((await f.call('/unsubscribe/' + 'x'.repeat(43),{auth:false})).status,400);
  } finally {await f.close();}
});
test('repeated failed authorization is rate limited', async () => {
  const f = await fixture();
  try {
    let result;
    for (let i=0;i<33;i++) result=await f.call('/api/lists',{auth:false});
    assert.equal(result!.status,429);
    assert.equal(result!.headers['retry-after'],'60');
  } finally {await f.close();}
});
