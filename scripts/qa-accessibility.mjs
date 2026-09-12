import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const { chromium } = await import(process.env.NDP_PLAYWRIGHT_MODULE || 'playwright');
const axe = await readFile(process.env.NDP_AXE_PATH || '/tmp/ndp-axe/package/axe.min.js','utf8');
const snapshot = JSON.parse(await readFile('pages-site/articles-snapshot.json','utf8'));
const browser = await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
 const context = await browser.newContext({viewport:{width:390,height:844}, reducedMotion:'reduce'});
 await context.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:4175/') ? route.continue() : route.abort());
 const page=await context.newPage();
 for (const route of ['/', '/about/', '/articles/', ...snapshot.articles.map(a=>`/articles/${a.slug}/`), '/admin/articles/']) {
  await page.goto(`http://127.0.0.1:4175${route}`,{waitUntil:'domcontentloaded'}); await page.locator('h1').waitFor();
  await page.addScriptTag({content:axe});
  const report=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
  // The existing faint decorative grids make axe mark inherited backgrounds
  // incomplete. Check the underlying solid palette separately, without editing CSS.
  await page.addStyleTag({content:'*,*::before,*::after{background-image:none!important}'});
  const solid = await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'rule',values:['color-contrast']}}));
  results.push({route,solidPaletteViolations:solid.violations,violations:report.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:report.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))});
 }
} finally {await browser.close();}
await mkdir('outputs/publication-qa',{recursive:true});
await writeFile(resolve('outputs/publication-qa/accessibility-results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({pages:results.length,violations:results.reduce((n,r)=>n+r.violations.length,0),incomplete:results.filter(r=>r.incomplete.length).map(r=>r.route)}));
