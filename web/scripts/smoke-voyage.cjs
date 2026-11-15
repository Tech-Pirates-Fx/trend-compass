const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const milestone=process.env.VOYAGE_MILESTONE||'M0';
const dir=`../docs/screenshots/voyage-${milestone}`;fs.mkdirSync(dir,{recursive:true});
(async()=>{
 console.log('Launching local Chromium');
 const browser=await chromium.launch({channel:'chrome',headless:true,timeout:15000});
 console.log('Browser launched');
 const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
 const bootStarted=Date.now();console.log('Opening voyage');await page.goto(process.env.VOYAGE_URL||'http://127.0.0.1:3110/voyage',{timeout:30000,waitUntil:'domcontentloaded'});console.log('Page loaded');
 const host=page.locator('.voyage-host');try{await page.waitForFunction(()=>document.querySelector('.voyage-host')?.dataset.phase==='sea',{},{timeout:30000});}catch(e){console.log(await page.locator('body').innerText());await page.screenshot({path:`${dir}/diagnostic.png`});throw e;}
 console.log('Controllable ship boot ms:',Date.now()-bootStarted);assert.ok(Date.now()-bootStarted<10000,'ship controllable within 10 seconds');
 let n=0;async function shot(label){await page.screenshot({path:`${dir}/${String(++n).padStart(2,'0')}-${label}.png`});}
 await shot('boot');
 assert.ok(await page.evaluate(()=>document.scrollingElement.scrollHeight<=innerHeight),'no scroll');
 const box=await page.locator('canvas').boundingBox();assert.ok(Math.abs(box.width/box.height-16/9)<.01);
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(350);await shot('sailing-1');
 await page.waitForTimeout(350);await shot('sailing-2');await page.waitForTimeout(350);await page.keyboard.up('ArrowLeft');
 await shot('beacon-near');assert.ok(Number(await host.getAttribute('data-distance'))>180);
 await page.keyboard.press('e');await page.waitForTimeout(100);assert.equal(await host.getAttribute('data-phase'),'net');await shot('beacon-entered');
 if(milestone==='M0'){
  for(let i=0;i<3;i++){await page.keyboard.press(i%2?'p':'m');await shot(`setting-${i}`);}
 }else{
  await page.keyboard.press('n');await page.waitForTimeout(100);assert.equal(await host.getAttribute('data-phase'),'compass');await shot('net-cast');
  // Estimate by dial input. Deliberately unsupported claim proves failure, no injected game state.
  await page.keyboard.down('ArrowLeft');await page.waitForTimeout(1200);await page.keyboard.up('ArrowLeft');
  await page.keyboard.press('Enter');await page.waitForTimeout(100);assert.equal(await host.getAttribute('data-phase'),'storm');await shot('compass-locked');
  for(let i=0;i<6;i++)await page.keyboard.press('Space');await shot('noise-storms');
  await page.keyboard.press('Enter');await page.waitForTimeout(100);assert.equal(await host.getAttribute('data-phase'),'court');await shot('court');
  for(const key of ['1','2','3','4','5','c'])await page.keyboard.press(key);
  await page.keyboard.press('Enter');await page.waitForTimeout(100);assert.equal(await host.getAttribute('data-phase'),'mutiny');await shot('mutiny');
  await page.mouse.click(640,575);await page.waitForTimeout(100);assert.equal(await host.getAttribute('data-phase'),'sea');await shot('retry');
  await page.keyboard.down('ArrowLeft');await page.waitForTimeout(1050);await page.keyboard.up('ArrowLeft');await page.keyboard.press('e');await page.waitForTimeout(100);
  await page.mouse.move(420,220);await page.mouse.down();await page.mouse.move(860,440,{steps:12});await page.mouse.up();await page.waitForTimeout(100);assert.equal(await host.getAttribute('data-phase'),'compass');await shot('pointer-net');
  const c=JSON.parse(fs.readFileSync('public/voyage/cases/first-light.json','utf8'));const ys=c.series.map(p=>p.v);const range=Math.max(.1,(Math.max(...ys)-Math.min(...ys))/4);
  const angle=Math.PI+(c.answerKey.senSlopePerDecade/range+1)*Math.PI/2;
  await page.mouse.move(950,320);await page.mouse.down();await page.mouse.move(950+Math.cos(angle)*100,320+Math.sin(angle)*100,{steps:10});await page.mouse.up();
  console.log('Sample reducer + DOM feedback ms:',await host.getAttribute('data-feedback-ms'));assert.ok(Number(await host.getAttribute('data-feedback-ms'))<100);await shot('pointer-compass');await page.mouse.click(960,570);await page.waitForTimeout(100);
  for(let i=0;i<6;i++){await page.mouse.click(290,505);await page.waitForFunction(n=>Number(document.querySelector('.voyage-host')?.dataset.volleys)===n,i+1);await page.waitForTimeout(30);}
  await page.mouse.move(570,555);await page.mouse.down();await page.mouse.move(920,555,{steps:8});await page.mouse.up();await page.waitForTimeout(30);await page.mouse.click(1090,570);await page.waitForTimeout(100);assert.equal(await host.getAttribute('data-phase'),'court');
  const destinations=[[490,245],[640,365],[190,245],[790,245],[1090,245]];
  for(let i=0;i<5;i++){await page.mouse.move(147+i*246,470);await page.mouse.down();await page.mouse.move(...destinations[i],{steps:8});await page.mouse.up();await page.waitForTimeout(40);}
  assert.equal(await host.getAttribute('data-receipts'),'4');await shot('pointer-court');await page.mouse.click(1000,585);await page.waitForTimeout(100);assert.equal(await host.getAttribute('data-phase'),'reveal');await shot('verified-reveal');
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>document.scrollingElement.scrollHeight<=innerHeight));
 assert.deepEqual(errors,[]);console.log(`PASS ${milestone}: boot, 16:9, no scroll, keyboard sail, enter beacon, ${n} sequential screenshots, mobile fit, no page errors`);
 if(milestone==='M1'){
  await page.route('**/api/py/data-management',route=>route.fulfill({json:{controls:{enabled:false,gistemp:false,saved_voyages:false,nasa_imagery:false},can_play:false,variables:[]}}));
  await page.reload({waitUntil:'domcontentloaded'});await page.getByText('Voyage data is disabled in Data Management.').waitFor();assert.equal(await page.locator('canvas').count(),0);console.log('PASS disabled source stops the game; no fallback observations');
  await page.unroute('**/api/py/data-management');
  await page.route('**/voyage/catalog.json',route=>route.fulfill({json:{cases:[]}}));await page.reload({waitUntil:'domcontentloaded'});await page.getByText('Clear Current archetype unavailable in the real record.').waitFor();assert.equal(await page.locator('canvas').count(),0);console.log('PASS missing archetype fails honestly');
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
