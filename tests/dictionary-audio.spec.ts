import {test,expect} from '@playwright/test';
import {dictionaryEntries} from '../src/dictionary/content';

test('all 90 Filipino dictionary words decode and play without a browser voice',async({page})=>{
 await page.addInitScript(()=>{
  Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});
  const NativeAudio=window.Audio;
  (window as any).played=[];
  window.Audio=new Proxy(NativeAudio,{construct(Target,args){
   const audio=new Target(...args);
   audio.addEventListener('playing',()=>{(window as any).played.push(audio.src);});
   return audio;
  }});
 });
 await page.goto('/');
 const paths=dictionaryEntries.map(entry=>entry.filipinoAudio);
 expect(paths).toHaveLength(90);expect(paths.every(Boolean)).toBe(true);
 const decoded=await page.evaluate(async(paths)=>{
  const context=new AudioContext();
  try{return await Promise.all(paths.map(async path=>{
   const response=await fetch(path!);if(!response.ok)throw Error(path);
   const audio=await context.decodeAudioData(await response.arrayBuffer());
   return {duration:audio.duration,signal:audio.getChannelData(0).some(value=>Math.abs(value)>0.001)};
  }));}finally{await context.close();}
 },paths);
 expect(decoded.every(audio=>audio.duration>0&&audio.signal)).toBe(true);
 await page.evaluate(()=>localStorage.setItem('basabuddy:v1',JSON.stringify({version:1,profiles:[{id:'audio-reader',name:'Reader',grade:'1'}],activeId:'audio-reader',language:'fil',progress:{},assignments:[],quests:{}})));
 await page.goto('/student/dictionary');
 await page.getByRole('button',{name:'Isda Fish',exact:true}).click();
 const detail=page.getByRole('region',{name:'Vocabulary detail: Isda'});
 await detail.getByRole('button',{name:'Pakinggan',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).played.length)).toBe(1);
 expect(await page.evaluate(()=>(window as any).played[0])).toContain(dictionaryEntries.find(entry=>entry.filipino==='Isda')!.filipinoAudio!);
});
