// Production-screen audit. No learner data or external services are used.
import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {lessonBank} from '../src/content/lessons.ts';
import {freshAttempt} from '../src/domain/model.ts';
const base=process.env.IMAGE_AUDIT_URL||'http://localhost:4173';
const output=process.env.IMAGE_AUDIT_OUT||'/tmp/basabuddy-image-audit';
await mkdir(output,{recursive:true});
const assets=JSON.parse(await readFile(new URL('../src/data/assets.json',import.meta.url)));
const dimensions=Object.fromEntries(Object.values(assets).flatMap(a=>[a,...(a.variants||[])].map(v=>[v.src,[v.width,v.height]])));
const records=[],errors=[],responses=[];let completed=false;
const browser=await chromium.launch();
try{
 const request=await browser.newContext();
 for(const asset of Object.values(assets).flatMap(a=>[a,...(a.variants||[])])){
  if(responses.some(r=>r.src===asset.src))continue;
  const response=await request.request.get(base+asset.src+'?v='+asset.revision);
  const hash=createHash('sha256').update(await response.body()).digest('hex');
  const expected=createHash('sha256').update(await readFile(new URL('../public'+asset.src,import.meta.url))).digest('hex');
  responses.push({src:asset.src,status:response.status(),sha256:hash,expected,match:hash===expected});
  if(!response.ok()||hash!==expected)errors.push('Wrong served bytes '+asset.src);
 }
 await request.close();
 for(const [width,dpr] of [[320,2],[393,3],[412,2.625],[768,2],[1440,2]]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:dpr,serviceWorkers:'block'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const store={version:1,profiles:[{id:'audit',name:'Reader',grade:'1'}],activeId:'audit',language:'en',progress:{},assignments:[],quests:{}};
  for(const lang of ['fil','en'])for(const l of lessonBank[lang])store.progress[`audit:${lang}:${l.id}`]={completed:true,best:5,attempts:1,attempt:freshAttempt(),updatedAt:new Date().toISOString()};
  await page.goto(base);
  async function seed(data=store){await page.evaluate(d=>localStorage.setItem('basabuddy:v1',JSON.stringify(d)),data);}
  async function inspect(label){
   const imgs=await page.locator('img').evaluateAll(async (elements,dimensions)=>{
    await Promise.all(elements.map(async im=>{im.loading='eager';try{await im.decode();}catch{}}));
    return elements.filter(im=>im.getClientRects().length&&getComputedStyle(im).visibility!=='hidden').map(im=>{
     const s=getComputedStyle(im),r=im.getBoundingClientRect();
     const w=r.width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),h=r.height-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom);
     const source=new URL(im.currentSrc||im.src).pathname;const [nw,nh]=dimensions[source]||[im.naturalWidth,im.naturalHeight];
     const ratio=Math.min(w/nw,h/nh);const scale=s.objectFit==='scale-down'?Math.min(1,ratio):ratio;
     return {src:source,url:im.currentSrc||im.src,alt:im.alt,natural:[nw,nh],browserNatural:[im.naturalWidth,im.naturalHeight],box:[r.width,r.height],painted:[nw*scale,nh*scale],objectFit:s.objectFit,transform:s.transform,filter:s.filter,density:1/scale,requiredDpr:devicePixelRatio,cssUpscale:scale>1.01,broken:!im.naturalWidth,declared:[im.getAttribute('width'),im.getAttribute('height')]};
    });
   },dimensions);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   const svg=await page.locator('svg').evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).length);
   records.push({width,dpr,label,overflow,images:imgs,visibleSvgCount:svg});
   if(imgs.some(i=>i.broken))errors.push('Broken image '+label);
   if(overflow)errors.push('Overflow '+width+' '+label);
   if(imgs.some(i=>i.cssUpscale))errors.push('CSS enlargement '+width+' '+label);
   if(width===393||(/^(en\/|teacher-|daily-complete|profiles-empty)/.test(label))||/^en-L(08|14|16)-(0|1|7)$/.test(label))await page.screenshot({path:`${output}/${width}-${label.replace(/[^a-z0-9-]/gi,'_')}.png`,fullPage:true});
  }
  const routes=['/welcome','/roles','/profiles','/language','/student/home','/student/levels','/student/dictionary','/student/journey','/student/daily','/student/stories','/student/settings',...['repeat','aloud','puzzle','sentence','story','find','word'].map(t=>'/student/practice/'+t),'/missing'];
  for(const lang of ['en','fil']){
   store.language=lang;await seed();
   for(const route of routes){await page.goto(base+route);await inspect(lang+route);
    if(route==='/student/dictionary'){await page.getByRole('button',{name:lang==='fil'?'Pagkain':'Food',exact:true}).click();await inspect(lang+route+'-food');}
    if(route==='/student/practice/word')for(let i=1;i<3;i++){await page.getByRole('button',{name:lang==='fil'?'Susunod na salita':'Next word',exact:true}).click();await inspect(lang+route+'-'+i);}
   }
   for(const lesson of lessonBank[lang]){
    for(const stage of [0,1,...lesson.questions.flatMap((q,i)=>q.image?[i+2]:[]),7]){
     const attempt={...freshAttempt(),step:stage===7?6:stage,finished:stage===7,answers:stage===7?lesson.questions.map(q=>q.answer):Array(5).fill(null)};
     store.progress[`audit:${lang}:${lesson.id}`].attempt=attempt;
     await seed();await page.goto(`${base}/learn/${lang}/${lesson.id}`);await inspect(`${lang}-${lesson.id}-${stage}`);
    }
   }
  }
  await seed({...store,profiles:[],activeId:''});await page.goto(base+'/profiles');await inspect('profiles-empty');
  for(const role of ['teacher']){
   await seed();await page.goto(base+'/adult/'+role);await inspect(role+'-gate');
   await page.getByLabel('Teacher PIN',{exact:true}).fill('2468');await page.getByLabel('Confirm PIN').fill('2468');await page.getByRole('button',{name:'Save PIN and continue'}).click();
   for(const tab of ['overview','students','reports','assign']){await page.getByRole('button',{name:tab,exact:true}).click();await inspect(role+'-'+tab);}
  }
  await seed({...store,quests:{[`audit:en:${new Date().toLocaleDateString('en-CA')}`]:['word','aloud','story']},language:'en'});await page.goto(base+'/student/daily');await inspect('daily-complete');
  console.log(`Audited ${width}px / DPR ${dpr}`);await context.close();
 }
 completed=true;
}finally{await browser.close();await writeFile(output+'/screens.json',JSON.stringify({completed,responses,records,errors},null,2));}
console.log(`${records.length} screen states; ${errors.length} errors`);if(errors.length){console.error(errors);process.exitCode=1;}
