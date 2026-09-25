import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHmac } from 'node:crypto';
import { MarketingStore } from '../src/store.ts';
import { CampaignService, EMAIL_TEMPLATES } from '../src/campaigns.ts';
import { LocalEmailProvider, verifySignedWebhook } from '../src/provider.ts';
import type { EmailMessage, EmailProvider, ProviderEvent } from '../src/provider.ts';
import { parseAttribution, campaignUrl } from '../src/attribution.ts';

function fixture(t: {after:(fn:()=>void)=>void}, provider?: EmailProvider) {
  const dir = mkdtempSync(join(tmpdir(),'ndp-campaign-test-'));
  const store = new MarketingStore(':memory:');
  const list = store.createList('Synthetic campaign TEST');
  const first = store.addCompany(list.id,{company_name:'Garden State Machine Works TEST',general_public_email:'hello@machine.example.test',industry:'Manufacturing',city:'Cranford'},'Synthetic TEST');
  store.addCompany(list.id,{company_name:'Somerset Associates TEST',general_public_email:'hello@somerset.example.test',industry:'Professional services',city:'Somerville'},'Synthetic TEST');
  const config = {publicBaseUrl:'http://127.0.0.1:4310',websiteOrigin:'https://netherwooddatapartners.com',senderName:'Netherwood Data Partners',senderEmail:'sender@example.test',postalAddress:'LOCAL TEST ONLY',testRecipient:'owner@example.test'};
  const service = new CampaignService(store,provider || new LocalEmailProvider(dir),config);
  t.after(()=>{store.close();rmSync(dir,{recursive:true,force:true});});
  const campaign = service.create({name:'NJ manufacturers TEST',channel:'email',list_id:list.id,landing_page:'/#business-systems'});
  return {store,list,first,config,service,campaign,dir};
}
async function approve(f: ReturnType<typeof fixture>) {
  const preview = f.service.preview(f.campaign.id);
  await f.service.testSend(f.campaign.id);
  f.service.ready(f.campaign.id);
  f.service.approve(f.campaign.id,{recipientCount:preview.recipientCount,confirmation:'APPROVE'});
  return preview.recipientCount;
}
function messages(dir:string): {message:EmailMessage}[] { return readdirSync(dir).filter(file=>file.endsWith('.json')).map(file=>JSON.parse(readFileSync(join(dir,file),'utf8')) as {message:EmailMessage}); }

test('every approval gate is required; production is unavailable; local results are honest and repeat send is idempotent', async t=>{
  const f=fixture(t);
  await assert.rejects(f.service.send(f.campaign.id,{recipientCount:0,confirmation:'SEND'}),/explicitly approved/);
  assert.throws(()=>f.service.ready(f.campaign.id),/test send/);
  assert.throws(()=>f.service.approve(f.campaign.id,{recipientCount:0,confirmation:'APPROVE'}),/Explicit approval/);
  const count=await approve(f);
  assert.equal(count,2);
  await assert.rejects(f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND',production:true}),/Production sending is unavailable/);
  await assert.rejects(f.service.send(f.campaign.id,{recipientCount:3,confirmation:'SEND'}),/exact approved/);
  assert.equal((await f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND'})).status,'local_sent');
  await f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND'});
  await assert.rejects(f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND',production:true}),/Production sending is unavailable/);
  assert.equal(messages(f.dir).length,3);
  const row=f.service.dashboard()[0]!;
  assert.equal(row.simulated,2);assert.equal(row.delivered,0);assert.equal(row.clicked,0);assert.equal(row.click_through_rate,null);
  assert.match(readFileSync(join(f.dir,readdirSync(f.dir).find(x=>x.endsWith('.eml'))!),'utf8'),/X-Netherwood-Mode: local-no-network/);
});

test('preview freezes recipient/content snapshot and sender; later imports cannot expand an approval', async t=>{
  const f=fixture(t);
  const first=f.service.preview(f.campaign.id);
  f.store.addCompany(f.list.id,{company_name:'Late Arrival TEST',general_public_email:'new@late.example.test'},'Synthetic TEST');
  f.store.db.prepare("UPDATE companies SET company_name='Changed' WHERE general_public_email='hello@machine.example.test'").run();
  const second=f.service.preview(f.campaign.id);
  assert.equal(second.recipientCount,2);assert.deepEqual(second.recipients,first.recipients);
  assert.match(second.sample.text,/Garden State Machine Works TEST/);
  assert.equal(second.campaign.status,'preview');
});

test('suppression after approval and company do-not-contact are rechecked immediately before sends', async t=>{
  const f=fixture(t);const count=await approve(f);
  f.store.suppress('HELLO@MACHINE.EXAMPLE.TEST','manual','Synthetic test');
  f.store.db.prepare("UPDATE companies SET do_not_contact=1 WHERE general_public_email='hello@somerset.example.test'").run();
  await f.service.send(f.campaign.id,{recipientCount:count,confirmation:'SEND'});
  assert.equal(messages(f.dir).filter(x=>!x.message.test).length,0);
  assert.equal(f.service.dashboard()[0]!.skipped,2);
});

test('unsubscribe tokens are opaque, stored only hashed, survive list deletion, and suppress snapshot email after company changes', async t=>{
  const f=fixture(t);await approve(f);
  await f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND'});
  const mail=messages(f.dir).find(x=>!x.message.test && x.message.to==='hello@machine.example.test')!.message;
  const token=new URL(mail.unsubscribeUrl).pathname.split('/').pop()!;
  assert.match(token,/^[A-Za-z0-9_-]{43}$/);assert.equal(mail.unsubscribeUrl.includes(mail.to),false);
  assert.equal(f.service.inspectUnsubscribe(token),true);
  assert.equal(f.store.isSuppressed(mail.to),false,'GET inspection has no effect');
  const stored=f.store.db.prepare("SELECT token_hash FROM campaign_tokens WHERE kind='unsubscribe' AND email=?").get(mail.to)!;
  assert.notEqual(stored.token_hash,token);assert.match(String(stored.token_hash),/^[a-f0-9]{64}$/);
  f.store.db.prepare('UPDATE companies SET general_public_email=? WHERE general_public_email=?').run('replacement@machine.example.test',mail.to);
  f.store.deleteList(f.list.id);
  assert.equal(f.service.unsubscribe(token),true);assert.equal(f.service.unsubscribe(token),true);
  assert.equal(f.store.isSuppressed(mail.to),true);assert.equal(f.store.isSuppressed('replacement@machine.example.test'),false);
  const newList=f.store.createList('Reimport TEST');
  f.store.addCompany(newList.id,{company_name:'Reimport TEST',general_public_email:mail.to},'Synthetic reimport');
  assert.equal(f.store.eligibleCompanies(newList.id).length,0);
  assert.equal(f.service.unsubscribe('bad-token'),false);
});

test('test-send unsubscribe affects only test recipient and never campaign click/delivery totals', async t=>{
  const f=fixture(t);f.service.preview(f.campaign.id);await f.service.testSend(f.campaign.id);
  const mail=messages(f.dir)[0]!.message;
  assert.equal(mail.to,'owner@example.test');
  const token=new URL(mail.unsubscribeUrl).pathname.split('/').pop()!;
  f.service.unsubscribe(token);
  assert.equal(f.store.isSuppressed('owner@example.test'),true);
  assert.equal(f.store.isSuppressed('hello@machine.example.test'),false);
  assert.equal(f.service.dashboard()[0]!.unsubscribed,0);
});

test('tracking URLs retain UTM and safe campaign code without email; local clicks never inflate results', async t=>{
  const f=fixture(t);await approve(f);await f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND'});
  const mail=messages(f.dir).find(x=>!x.message.test)!.message;
  const link=mail.text.match(/http:\/\/127\.0\.0\.1:4310\/r\/([A-Za-z0-9_-]+)/)!;
  const destination=f.service.resolveClick(link[1]!)!;const url=new URL(destination);
  assert.equal(url.searchParams.get('utm_source'),'email');assert.equal(url.searchParams.get('nwd_campaign'),f.campaign.campaign_code);
  assert.equal(destination.includes(mail.to),false);assert.equal(url.hash,'#business-systems');
  assert.equal(f.service.dashboard()[0]!.clicked,0);assert.equal(f.service.resolveClick('bad-token'),null);
});

test('HTML and CSV values are escaped, headers and unknown template personalization rejected', t=>{
  const f=fixture(t);
  f.store.db.prepare("UPDATE companies SET company_name='<img src=x onerror=alert(1)>' WHERE general_public_email='hello@machine.example.test'").run();
  const preview=f.service.preview(f.campaign.id);
  assert.equal(preview.sample.html.includes('<img'),false);assert.match(preview.sample.html,/&lt;img/);
  assert.throws(()=>f.service.create({name:'Bad',channel:'email',list_id:f.list.id,landing_page:'/',subject:'Hello\r\nBcc: all@example.test'}),/one line/);
  assert.throws(()=>f.service.create({name:'Bad',channel:'email',list_id:f.list.id,landing_page:'/',body:'{{private_inference}}'}),/Only company_name/);
  f.store.db.prepare("UPDATE campaign_recipients SET company_name='=HYPERLINK(test)' WHERE campaign_id=?").run(f.campaign.id);
  assert.match(f.service.exportResults(f.campaign.id),/'=HYPERLINK/);
  assert.equal(EMAIL_TEMPLATES.length,3);
});

test('a provider exception is persisted as uncertain and never blindly retried', async t=>{
  let calls=0;
  const provider:EmailProvider={name:'fake-local-test',mode:'local',validateConfiguration:()=>({valid:true,production:false,errors:[]}),sendMessage:async message=>{calls++;if(message.test)return{messageId:'test-only',status:'simulated'};throw new Error('Unknown provider outcome');},sendCampaign:async()=>[],handleWebhook:async()=>[]};
  const f=fixture(t,provider);await approve(f);
  await assert.rejects(f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND'}),/Unknown provider outcome/);
  assert.equal(f.service.get(f.campaign.id).status,'failed');assert.equal(f.service.dashboard()[0]!.needs_review,1);
  await assert.rejects(f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND'}),/explicitly approved/);
  assert.equal(calls,2);
});

test('attribution event idempotency, bounded privacy allowlist, manual aggregate traffic and conversion denominators', t=>{
  const f=fixture(t);
  const ad=f.service.create({name:'NJ migration ads',channel:'google_ads',landing_page:'/#business-systems'});
  const event={event_id:'form_102',event_name:'inquiry_submitted' as const,campaign_code:ad.campaign_code,attribution:{utm_source:'google',utm_campaign:'nj_migration',landing_page:'/data-migration'}};
  assert.deepEqual(f.service.recordAttributionEvent(event),{accepted:true,duplicate:false});
  assert.deepEqual(f.service.recordAttributionEvent(event),{accepted:true,duplicate:true});
  assert.throws(()=>f.service.recordAttributionEvent({...event,event_name:'customer_created'}),/different event/);
  f.service.recordTraffic(ad.id,{visits:10,source:'analytics',date:'2026-01-01'});
  f.service.recordTraffic(ad.id,{visits:20,source:'analytics',date:'2026-01-01'});
  f.service.recordOutcome(ad.id,{type:'customer'});
  const row=f.service.dashboard().find(x=>x.id===ad.id)!;
  assert.equal(row.traffic,20);assert.equal(row.inquiries,1);assert.equal(row.customers,1);assert.equal(row.inquiry_conversion_rate,0.05);assert.equal(row.customer_conversion_rate,1);
  assert.deepEqual(parseAttribution(new URL('https://example.test/data-migration?email=private@example.test&utm_source=email&utm_campaign=nj_test&gclid=secret')), {utm_source:'email',utm_campaign:'nj_test',landing_page:'/data-migration'});
  assert.deepEqual(parseAttribution({utm_source:'person@example.test',utm_medium:'a'.repeat(101),landing_page:'/path?email=private'}),{});
  assert.throws(()=>f.service.recordTraffic(ad.id,{visits:-1}),/Visits/);
  assert.throws(()=>f.service.recordTraffic(ad.id,{visits:2,date:'2026-02-31'}),/valid past/);
  assert.throws(()=>campaignUrl({...ad,landing_page:'https://evil.example/path'},f.config.websiteOrigin),/configured public/);
  assert.throws(()=>campaignUrl({...ad,landing_page:'/?email=private@example.test'},f.config.websiteOrigin),/unsupported/);
  assert.throws(()=>campaignUrl({...ad,landing_page:'/#private@example.test'},f.config.websiteOrigin),/plain section/);
});

test('webhook helper authenticates exact raw body with bounded replay window and constant-time signatures',()=>{
  const secret='s'.repeat(40);const timestamp=String(Math.floor(Date.now()/1000));const raw='{"event":"hard_bounce"}';
  const signature=createHmac('sha256',secret).update(`${timestamp}.${raw}`).digest('hex');
  assert.equal(verifySignedWebhook(raw,signature,timestamp,secret),true);
  assert.equal(verifySignedWebhook(raw+' ',signature,timestamp,secret),false);
  assert.equal(verifySignedWebhook(raw,signature,timestamp,secret,Date.now()+600_000),false);
  assert.equal(verifySignedWebhook(raw,'bad',timestamp,secret),false);
});

test('authenticated adapter webhooks deduplicate delivery and persist hard-bounce / complaint suppression',async t=>{
  let events:ProviderEvent[]=[];
  const provider:EmailProvider={name:'test-adapter',mode:'local',validateConfiguration:()=>({valid:true,production:false,errors:[]}),sendMessage:async m=>({messageId:m.idempotencyKey,status:'simulated'}),sendCampaign:async()=>[],handleWebhook:async (_raw,headers)=>{if(headers.authorization!=='test-auth')throw new Error('Unauthenticated webhook');return events;}};
  const f=fixture(t,provider);await approve(f);await f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND'});
  const send=f.store.db.prepare('SELECT provider_message_id FROM campaign_sends LIMIT 1').get()!;
  events=[{id:'evt1',messageId:String(send.provider_message_id),type:'hard_bounce',occurredAt:new Date().toISOString()}];
  await assert.rejects(f.service.handleWebhook('{}',{}),/Unauthenticated/);
  assert.deepEqual(await f.service.handleWebhook('{}',{authorization:'test-auth'}),{accepted:1});
  assert.deepEqual(await f.service.handleWebhook('{}',{authorization:'test-auth'}),{accepted:0});
  assert.equal(f.service.dashboard()[0]!.bounced,1);
  assert.equal(f.store.eligibleCompanies(f.list.id).length,1);
});

test('clicks on confirmed provider-accepted messages count during sending or after partial failure',async t=>{
  const f=fixture(t);await approve(f);await f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND'});
  const mail=messages(f.dir).find(x=>!x.message.test)!.message;
  const token=mail.text.match(/http:\/\/127\.0\.0\.1:4310\/r\/([A-Za-z0-9_-]+)/)![1]!;
  f.store.db.prepare("UPDATE campaign_sends SET status='accepted' WHERE idempotency_key=?").run(mail.idempotencyKey);
  f.store.db.prepare("UPDATE campaigns SET status='failed' WHERE id=?").run(f.campaign.id);
  assert.ok(f.service.resolveClick(token));assert.ok(f.service.resolveClick(token));
  assert.equal(f.service.dashboard()[0]!.clicked,1);
});

test('manual outcome reference dedup, non-email export, unknown source and invalid calendar dates',t=>{
  const f=fixture(t);
  const ad=f.service.create({name:'Referral TEST',channel:'referral',landing_page:'/'});
  assert.equal(f.service.recordOutcome(ad.id,{type:'inquiry',reference:'inquiry_102'}).duplicate,false);
  assert.equal(f.service.recordOutcome(ad.id,{type:'inquiry',reference:'inquiry_102'}).duplicate,true);
  f.service.recordTraffic(ad.id,{visits:5,source:'manual',date:'2026-01-01'});
  assert.match(f.service.exportResults(ad.id),/"summary"/);
  assert.equal(f.service.dashboard().find(row=>row.id===ad.id)!.inquiries,1);
  f.service.recordAttributionEvent({event_id:'no_utm_001',event_name:'inquiry_submitted'});
  assert.equal(f.store.db.prepare("SELECT source FROM campaign_events WHERE event_id='no_utm_001'").get()!.source,'unknown');
  assert.throws(()=>f.service.recordAttributionEvent({event_id:'bad_date',event_name:'inquiry_submitted',occurred_at:'2026-02-30T12:00:00Z'}),/valid UTC/);
  assert.throws(()=>campaignUrl({...ad,landing_page:'/private@example.test'},f.config.websiteOrigin),/clean public/);
  assert.ok(f.store.db.prepare("SELECT version FROM schema_migrations WHERE version='002-campaigns-attribution'").get());
});

test('unassigned organic, paid and unknown inquiry events stay visible as distinct sources',t=>{
  const f=fixture(t);
  f.service.recordAttributionEvent({event_id:'organic_101',event_name:'inquiry_submitted',attribution:{utm_source:'google',utm_medium:'organic'}});
  f.service.recordAttributionEvent({event_id:'paid_102',event_name:'inquiry_submitted',attribution:{utm_source:'google',utm_medium:'cpc'}});
  f.service.recordAttributionEvent({event_id:'unknown_103',event_name:'customer_created'});
  const rows=f.service.sourceSummary();
  assert.equal(rows.length,3);
  assert.equal(rows.find(row=>row.channel==='organic_search')!.inquiries,1);
  assert.equal(rows.find(row=>row.channel==='google_ads')!.inquiries,1);
  assert.equal(rows.find(row=>row.source==='unknown')!.customers,1);
  assert.equal(rows.some(row=>row.source==='direct'),false);
});

test('local outbox idempotency returns same receipt and rejects changed content under an existing key',async t=>{
  const f=fixture(t);await approve(f);await f.service.send(f.campaign.id,{recipientCount:2,confirmation:'SEND'});
  const message=messages(f.dir).find(item=>!item.message.test)!.message;
  const provider=new LocalEmailProvider(f.dir);
  const first=await provider.sendMessage(message);const second=await provider.sendMessage(message);
  assert.deepEqual(first,second);assert.equal(messages(f.dir).length,3);
  await assert.rejects(provider.sendMessage({...message,to:'different@example.test'}),/idempotency conflict/);
});
