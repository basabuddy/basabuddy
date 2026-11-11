import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonBank,dictionary} from '../src/content/lessons';
import {freshAttempt} from '../src/domain/model';
const checklist=JSON.parse(readFileSync('docs/audio-recording-checklist.json','utf8'));
const manifest=JSON.parse(readFileSync('src/audio/manifest.json','utf8'));

test('Filipino and English checklists equal text played by all actual UI audio controls',async({page})=>{
 test.setTimeout(240000);
 await page.addInitScript(()=>{
  const api=new EventTarget() as any;api.getVoices=()=>[{lang:'fil-PH',localService:true},{lang:'en-US',localService:true}];api.cancel=()=>{};api.resume=()=>{};api.speak=(u:any)=>{(window as any).heard={text:u.text};u.onstart?.();};
  Object.defineProperty(window,'speechSynthesis',{value:api});
  Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class {text:string;constructor(text:string){this.text=text;}}});
  (window as any).Audio=class {src:string;onplaying:any;constructor(src:string){this.src=src;}play(){(window as any).heard={path:this.src};this.onplaying?.();return Promise.resolve();}pause(){}removeAttribute(){}load(){}};
 });
 const store:any={version:1,profiles:[{id:'coverage',name:'Reader',grade:'1'}],activeId:'coverage',language:'fil',progress:{},assignments:[],quests:{}};
 for(const lang of ['fil','en'] as const)for(const l of lessonBank[lang])store.progress[`coverage:${lang}:${l.id}`]={completed:true,best:5,attempts:1,attempt:freshAttempt(),updatedAt:new Date().toISOString()};
 await page.goto('/');
 for(const lang of ['fil','en'] as const){
  const f=lang==='fil',listenLabel=f?'Pakinggan':'Listen',slowLabel=f?'Dahan-dahan':'Slow',stopLabel=f?'Ihinto':'Stop';
  const checklist=JSON.parse(readFileSync('docs/audio-recording-checklist.json','utf8'));
  const manifest=JSON.parse(readFileSync('src/audio/manifest.json','utf8'));
  const heard=new Set<string>();
  const seed=async()=>page.evaluate(d=>localStorage.setItem('basabuddy:v1',JSON.stringify(d)),store);
  async function listen(both=false){
   for(const label of both?[listenLabel,slowLabel]:[listenLabel]){
    await page.locator('.audio-wrap > button').filter({hasText:label}).first().click();
    const actual=await page.evaluate(()=>(window as any).heard);
    expect(actual).toBeTruthy();
    const text=actual.text??Object.entries(manifest[lang]).find(([,path])=>path===actual.path)?.[0];
    expect(typeof text).toBe('string');heard.add(text);
    await page.getByRole('button',{name:stopLabel,exact:true}).click();
    await page.evaluate(()=>delete (window as any).heard);
   }
  }
  store.language=lang;
  await seed();
  for(const type of ['repeat','aloud','word','story','sentence','puzzle','find']){
   await page.goto('/student/practice/'+type);await listen(true);
   if(type==='word')for(let i=1;i<3;i++){await page.getByRole('button',{name:f?'Susunod na salita':'Next word',exact:true}).click();await listen(true);}
  }
  await page.goto('/student/dictionary');
  for(const item of dictionary){
   const category=item[3],categoryLabel=f?({Animals:'Hayop',Food:'Pagkain',Things:'Bagay'} as Record<string,string>)[category]:category;
   await page.getByRole('button',{name:categoryLabel,exact:true}).click();
   const name=f?`${item[1]} ${item[2]}`:`${item[2]} ${item[1]}`;
   await page.getByRole('button',{name:new RegExp(`${name}$`,'i')}).click();await listen();
  }
  for(const lesson of lessonBank[lang]){
   const progress=store.progress[`coverage:${lang}:${lesson.id}`];progress.attempt={...freshAttempt(),step:1};await seed();await page.goto(`/learn/${lang}/${lesson.id}`);await listen(true);
   for(const [i,q] of lesson.questions.entries()){
    progress.attempt={...freshAttempt(),step:i+2};await seed();await page.goto(`/learn/${lang}/${lesson.id}`);
    if(await page.getByRole('button',{name:listenLabel,exact:true}).count())await listen();
    progress.attempt={...freshAttempt(),step:i+2,checked:true,selected:['incorrect'],answers:Array(5).fill('incorrect')};await seed();await page.reload();
    await page.getByRole('button',{name:f?'Magsanay sa tamang sagot':'Practice the answer',exact:true}).click();
    const buttons=page.getByRole('button',{name:listenLabel,exact:true});
    await buttons.last().click();
    const actual=await page.evaluate(()=>(window as any).heard);
    const text=actual.text??Object.entries(manifest[lang]).find(([,path])=>path===actual.path)?.[0];
    expect(text).toBe(q.answer);heard.add(text);
   }
  }
  expect([...heard].sort()).toEqual(checklist[lang].map((x:any)=>x.text).sort());
  expect(checklist[lang].filter((x:any)=>x.bundled).map((x:any)=>x.text).sort()).toEqual(Object.keys(manifest[lang]).sort());
  expect(checklist[lang].every((x:any)=>x.locations.length>0)).toBe(true);
 }
});
