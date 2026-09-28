import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium} = await import(process.env.NDP_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NDP_QA_URL || 'http://127.0.0.1:4175';
const baseline = process.argv.includes('--baseline');
const output = resolve('outputs/products-qa', baseline ? 'before' : 'after');
await mkdir(output, {recursive:true});
const sitemap = await readFile('pages-dist/sitemap.xml','utf8');
const allPaths = baseline ? ['/', '/about/', '/services/', '/articles/', '/articles/what-query-store-tells-you-about-a-slow-sql-server/'] : [...sitemap.matchAll(/<loc>https:\/\/netherwooddatapartners.com(.*?)<\/loc>/g)].map(m=>m[1]);
// Select a real existing article instead of guessing a slug.
if (baseline) allPaths[4] = '/articles/'+JSON.parse(await readFile('pages-site/articles-snapshot.json','utf8')).articles[0].slug+'/';
const sampleArticle = '/articles/'+JSON.parse(await readFile('pages-site/articles-snapshot.json','utf8')).articles[0].slug+'/';
const paths = baseline ? allPaths : ['/', '/about/', '/services/', '/articles/', sampleArticle, '/products/', '/products/queryvault/', '/products/sql-server-index-visualizer/', '/products/activity-data-connector/', '/privacy/'];
const browser = await chromium.launch({channel:'msedge',headless:true});
const report = {renders:[], errors:[], checks:[]};
try {
 for (const width of [1440,768,390]) {
  const context = await browser.newContext({viewport:{width,height:1000}, reducedMotion:'reduce'});
  await context.route('**/*', route => route.request().method() === 'GET' && route.request().url().startsWith(base) ? route.continue() : route.abort());
  const page = await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  for (const path of paths) {
   const response = await page.goto(base+path,{waitUntil:'load'});
   assert.equal(response.status(),200,path);
   await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
   const metrics = await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length, brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),animations:document.getAnimations().filter(a=>a.playState==='running').length}));
   assert.ok(metrics.scrollWidth<=width,path+' overflow '+width);
   assert.equal(metrics.h1,1,path+' heading'); assert.deepEqual(metrics.brokenImages,[],path+' images'); assert.equal(metrics.animations,0);
   const name=path==='/'?'home':path.replaceAll('/','_').replace(/^_|_$/g,'');
   await page.screenshot({path:resolve(output,name+'-'+width+'.png'),fullPage:true});
   report.renders.push({path,...metrics});
  }
  await context.close();
 }
 const page = await browser.newPage({viewport:{width:320,height:900},reducedMotion:'reduce'});
 await page.goto(base+'/');
 await page.keyboard.press('Tab'); assert.equal(await page.locator(':focus').innerText(),'Skip to content');
 await page.keyboard.press('Enter'); assert.equal(await page.locator(':focus').getAttribute('id'),'main-content');
 if (!baseline) {
  await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Products',exact:true}).click();
  await page.getByRole('heading',{level:1}).waitFor(); assert.ok(page.url().includes('/products/'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320px product overflow');
  await page.screenshot({path:resolve(output,'products-320.png'),fullPage:true});
  for (const path of ['/products/missing/', '/products/queryvault/index.html', '/missing/']) {
   await page.goto(base+path); assert.equal(await page.locator('h1').count(),1,path);
  }
  await page.goto(base+'/products/'); await page.addStyleTag({content:'html{font-size:200%}'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% product overflow');
  await page.screenshot({path:resolve(output,'products-enlarged-320.png'),fullPage:true});
  report.checks.push('320px Products navigation','missing routes and index.html','200% text enlargement');
 }
 await page.close();
 const noJs = await browser.newPage({javaScriptEnabled:false});
 for (const path of allPaths) { await noJs.goto(base+path); assert.equal(await noJs.locator('h1').count(),1,path+' no JS'); }
 await noJs.goto(base+'/'); assert.equal(await noJs.locator('form[action^="https://submit-form.com/"]').count(),1);
 assert.ok(await noJs.locator('a[href="mailto:contact@netherwooddatapartners.com"]').count());
 await noJs.close();
 report.checks.push('keyboard skip link','reduced motion','no-JavaScript content on all routes','native Formspark and business email fallback');
 assert.deepEqual(report.errors,[],'Browser errors');
} finally {await writeFile(resolve(output,'results.json'),JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({baseline,renders:report.renders.length,checks:report.checks,errors:report.errors}));
