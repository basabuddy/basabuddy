// Run after npm run build and npm run preview -- --port 4173.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try {
 const context=await browser.newContext();
 const page=await context.newPage();
 await page.addInitScript(()=>{
  window.trialClips=[];
  const NativeAudio=window.Audio;
  window.Audio=new Proxy(NativeAudio,{construct(Target,args){const audio=new Target(...args);audio.addEventListener("ended",()=>{audio.trialEnded=true;});window.trialClips.push(audio);return audio;}});
 });
 await page.goto('http://localhost:4173');
 await page.evaluate(()=>localStorage.setItem('basabuddy:v1',JSON.stringify({version:1,profiles:[{id:'trial',name:'Trial',grade:'1'}],activeId:'trial',language:'fil',progress:{},assignments:[],quests:{}})));
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);
 for(const [route,text,file] of [
  ['/learn/fil/L01','ma','fil-3c44c3e1b8b78447.wav'],
  ['/student/practice/repeat','mansanas','fil-df06659ca0aea0ca.wav'],
  ['/student/practice/aloud','Ang pusa ay maliit.','fil-ffe24cde85367f86.wav']]) {
  await page.goto('http://localhost:4173'+route);
  if(route.startsWith('/learn'))await page.getByRole('button',{name:'Simulan ang aralin',exact:true}).click();
  for(const [label,rate] of [['Pakinggan',1],['Dahan-dahan',0.75]]) {
   await page.getByRole('button',{name:label,exact:true}).click();
   await page.waitForFunction(()=>{const a=window.trialClips.at(-1);return a&&!a.paused&&a.currentTime>0;});
   const actual=await page.evaluate(()=>{const a=window.trialClips.at(-1);return {file:new URL(a.src).pathname.split('/').pop(),rate:a.playbackRate,pitch:a.preservesPitch,duration:a.duration};});
   assert.equal(actual.file,file);assert.equal(actual.rate,rate);assert.equal(actual.pitch,true);assert.ok(actual.duration>1);
   await page.waitForFunction(()=>window.trialClips.at(-1).trialEnded);
   console.log('PASS offline native WAV playback:',text,label,actual);
  }
 }
 // English routing regression: deterministic local voice fixture, not an audible voice test.
 await page.addInitScript(()=>{
  const api=new EventTarget();api.getVoices=()=>[{name:'English test',lang:'en-US',localService:true,default:true}];api.cancel=()=>{};api.resume=()=>{};api.speak=u=>{window.trialUtterance=u;u.onstart?.();};
  Object.defineProperty(window,'speechSynthesis',{value:api});
  Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class {constructor(text){this.text=text;}}});
 });
 await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('basabuddy:v1'));data.language='en';localStorage.setItem('basabuddy:v1',JSON.stringify(data));});
 await page.goto('http://localhost:4173/student/practice/repeat');
 for(const [label,rate] of [['Listen',0.85],['Slow',0.65]]) {
  await page.getByRole('button',{name:label,exact:true}).click();
  await page.waitForFunction(rate=>window.trialUtterance?.rate===rate,rate);
  assert.deepEqual(await page.evaluate(()=>({text:window.trialUtterance.text,lang:window.trialUtterance.lang,rate:window.trialUtterance.rate})),{text:'apple',lang:'en-US',rate});
  assert.equal(await page.evaluate(()=>window.trialClips.length),0);
  console.log('PASS English local-voice routing:',label);
 }
} finally {await browser.close();}
