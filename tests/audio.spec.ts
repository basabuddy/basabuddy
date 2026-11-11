import { test, expect } from '@playwright/test';

async function reader(page: any, lang = 'en') {
  await page.goto('/');
  await page.evaluate((language: string) => localStorage.setItem('basabuddy:v1', JSON.stringify({version:1,profiles:[{id:'audio-reader',name:'Reader',grade:'1'}],activeId:'audio-reader',language,progress:{},assignments:[],quests:{}})),lang);
  await page.goto('/student/practice/repeat');
}
async function mockSpeech(page: any, locale: string | null = null) {
  // Isolate browser-voice fallback tests from real bundled recordings.
  await page.route('**/src/audio/manifest.json*', route => route.fulfill({contentType:'application/javascript',body:'export default {fil:{},en:{}}'}));
  await page.addInitScript((locale: string | null) => {
    const api = new EventTarget() as any;
    api.voices = locale ? [{name:'Test voice',lang:locale,default:true,localService:true}] : [];
    api.getVoices = () => api.voices;
    api.cancel = () => { api.cancels++; };
    api.cancels = 0;
    api.resumes = 0;
    api.resume = () => { api.resumes++; };
    api.speak = (utterance: any) => { api.utterance = utterance; utterance.onstart?.(); };
    Object.defineProperty(window,'speechSynthesis',{value:api,configurable:true});
    Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class {text:string;constructor(text:string){this.text=text;}},configurable:true});
  },locale);
}

test('late voice discovery retries in a user gesture and supports stop', async ({page}) => {
  await mockSpeech(page);
  await reader(page);
  await page.getByRole('button',{name:'Listen',exact:true}).click();
  await expect(page.locator('.audio-wrap [role=status]')).toContainText('voice is not ready');
  await page.evaluate(() => {const api=window.speechSynthesis as any;api.voices=[{name:'English',lang:'en_US',default:true,localService:true}];api.dispatchEvent(new Event('voiceschanged'));});
  await expect(page.locator('.audio-wrap [role=status]')).toHaveText('Voice ready. Tap Listen again.');
  await page.getByRole('button',{name:'Listen',exact:true}).click();
  await expect(page.locator('.audio-wrap [role=status]')).toHaveText('Playing…');
  expect(await page.evaluate(()=>(window.speechSynthesis as any).utterance.text)).toBe('apple');
  expect(await page.evaluate(()=>(window.speechSynthesis as any).resumes)).toBe(1);
  await page.getByRole('button',{name:'Stop',exact:true}).click();
  await expect(page.getByRole('button',{name:'Listen',exact:true})).toBeVisible();
});

test('Filipino accepts tl_PH and is never sent to an English voice',async({page})=>{
  await mockSpeech(page,'en-US');await reader(page,'fil');
  await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
  expect(await page.evaluate(()=>(window.speechSynthesis as any).utterance)).toBeUndefined();
  await page.evaluate(()=>{const api=window.speechSynthesis as any;api.voices=[{name:'Tagalog',lang:'tl_PH',default:true,localService:true}];api.dispatchEvent(new Event('voiceschanged'));});
  await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
  expect(await page.evaluate(()=>(window.speechSynthesis as any).utterance.lang)).toBe('tl-PH');
  expect(await page.evaluate(()=>(window.speechSynthesis as any).utterance.text)).toBe('mansanas');
});

test('speech errors permit retry and leaving stops narration',async({page})=>{
  await mockSpeech(page,'en-US');await reader(page);
  await page.getByRole('button',{name:'Listen',exact:true}).click();
  await page.evaluate(()=>(window.speechSynthesis as any).utterance.onerror({error:'audio-busy'}));
  await expect(page.locator('.audio-wrap [role=status]')).toContainText('Audio could not play');
  await page.getByRole('button',{name:'Listen',exact:true}).click();
  await expect(page.getByRole('button',{name:'Stop',exact:true})).toBeVisible();
  const before=await page.evaluate(()=>(window.speechSynthesis as any).cancels);
  await page.getByRole('button',{name:'Finish practice'}).click();
  await expect(page).toHaveURL(/student\/home/);
  await expect.poll(()=>page.evaluate(()=>(window.speechSynthesis as any).cancels)).toBeGreaterThan(before);
});

test('Filipino syllable, word and sentence select exact text and local voice at both speeds',async({page})=>{
 await mockSpeech(page,'tl_PH');await reader(page,'fil');
 for(const [route,text] of [['/learn/fil/L01','ma'],['/student/practice/repeat','mansanas'],['/student/practice/aloud','Ang pusa ay maliit.']]){
  await page.goto(route);
  if(route.startsWith('/learn'))await page.getByRole('button',{name:'Simulan ang aralin',exact:true}).click();
  for(const [label,rate] of [['Pakinggan',0.85],['Dahan-dahan',0.65]] as const){
   await page.getByRole('button',{name:label,exact:true}).click();
   expect(await page.evaluate(()=>{const u=(speechSynthesis as any).utterance;return {text:u.text,lang:u.lang,rate:u.rate};})).toEqual({text,lang:'tl-PH',rate});
   await expect(page.getByRole('button',{name:'Ihinto',exact:true})).toHaveCount(1);
  }
 }
});

test('remote Filipino voice is rejected with an accurate missing-recording message',async({page})=>{
 await mockSpeech(page,'fil-PH');await reader(page,'fil');
 await page.evaluate(()=>{const api=speechSynthesis as any;api.voices[0].localService=false;});
 await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
 await expect(page.locator('.audio-wrap [role=status]').first()).toContainText('Walang naka-bundle na recording');
 expect(await page.evaluate(()=>(speechSynthesis as any).utterance)).toBeUndefined();
});

test('normal and slow controls share one owner; next lesson step and mute stop speech',async({page})=>{
 await mockSpeech(page,'fil-PH');await reader(page,'fil');await page.goto('/learn/fil/L01');
 await page.getByRole('button',{name:'Simulan ang aralin',exact:true}).click();
 await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
 const before=await page.evaluate(()=>(speechSynthesis as any).cancels);
 await page.getByRole('button',{name:'Dahan-dahan',exact:true}).click();
 await expect(page.getByRole('button',{name:'Ihinto',exact:true})).toHaveCount(1);
 await page.getByRole('button',{name:'Handa na sa 5 tanong',exact:true}).click();
 await expect(page.getByRole('button',{name:'Ihinto',exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>(speechSynthesis as any).cancels)).toBeGreaterThan(before);
 await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
 await page.getByRole('button',{name:'I-mute ang tunog',exact:true}).click();
 await expect(page.getByRole('button',{name:'Ihinto',exact:true})).toHaveCount(0);
});

async function mockClips(page:any, failure=''){
 // Test-only files and media API: never presented as actual Filipino recordings.
 await page.route('**/src/audio/manifest.json*',(route:any)=>route.fulfill({contentType:'application/javascript',body:'export default {fil:{"ma":"/audio/fil-ma.wav","mansanas":"/audio/fil-apple.wav","Ang pusa ay maliit.":"/audio/fil-sentence.wav"},en:{"apple":"/audio/en-apple.wav"}}'}));
 await page.addInitScript((failure:string)=>{
  (window as any).clips=[];
  (window as any).Audio=class {
   src:string;volume=1;playbackRate=1;preservesPitch=false;paused=true;onplaying:any;onended:any;onerror:any;
   constructor(src:string){this.src=src;(window as any).clips.push(this);}
   play(){if(failure)return Promise.reject(new DOMException('Test failure',failure));this.paused=false;this.onplaying?.();return Promise.resolve();}
   pause(){this.paused=true;} removeAttribute(){} load(){}
  };
 },failure);
}

test('bundled Filipino clips take priority without speech and retain pitch when slowed',async({page})=>{
 await mockSpeech(page);await mockClips(page);await reader(page,'fil');
 for(const [route,src] of [['/learn/fil/L01','/audio/fil-ma.wav'],['/student/practice/repeat','/audio/fil-apple.wav'],['/student/practice/aloud','/audio/fil-sentence.wav']]){
  await page.goto(route);if(route.startsWith('/learn'))await page.getByRole('button',{name:'Simulan ang aralin',exact:true}).click();
  await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
  expect(await page.evaluate(()=>(window as any).clips.at(-1).src)).toBe(src);
  await page.getByRole('button',{name:'Dahan-dahan',exact:true}).click();
  expect(await page.evaluate(()=>{const clips=(window as any).clips;return {rate:clips.at(-1).playbackRate,pitch:clips.at(-1).preservesPitch,previousPaused:clips.at(-2).paused};})).toEqual({rate:0.75,pitch:true,previousPaused:true});
  expect(await page.evaluate(()=>(speechSynthesis as any).utterance)).toBeUndefined();
  await page.getByRole('button',{name:'Ihinto',exact:true}).click();
  await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
  await expect(page.getByRole('button',{name:'Ihinto',exact:true})).toHaveCount(1);
 }
});

test('blocked playback is explained and remains retryable',async({page})=>{
 await mockSpeech(page);await mockClips(page,'NotAllowedError');await reader(page,'fil');
 await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
 await expect(page.locator('.audio-wrap [role=status]').first()).toContainText('Hinarang ng browser');
 await expect(page.getByRole('button',{name:'Pakinggan',exact:true})).toBeEnabled();
});

test('missing or undecodable clip reports failure without substituting a voice',async({page})=>{
 await mockSpeech(page,'en-US');await mockClips(page);await reader(page,'fil');
 await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
 await page.evaluate(()=>(window as any).clips.at(-1).onerror());
 await expect(page.locator('.audio-wrap [role=status]').first()).toContainText('Hindi mabuksan ang recording');
 expect(await page.evaluate(()=>(speechSynthesis as any).utterance)).toBeUndefined();
});

test('bundled English uses its own recording and language switch stops Filipino speech',async({page})=>{
 await mockSpeech(page,'fil-PH');await mockClips(page);await reader(page,'en');
 await page.getByRole('button',{name:'Listen',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).clips.at(-1).src)).toBe('/audio/en-apple.wav');
 await page.goto('/student/home');await page.getByRole('button',{name:'Filipino',exact:true}).click();
 await page.goto('/student/dictionary');await page.getByRole('button',{name:/aso dog/i}).click();
 await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
 expect(await page.evaluate(()=>(speechSynthesis as any).utterance.text)).toBe('aso');
 const before=await page.evaluate(()=>(speechSynthesis as any).cancels);
 await page.getByRole('button',{name:'English',exact:true}).click();
 expect(await page.evaluate(()=>(speechSynthesis as any).cancels)).toBeGreaterThan(before);
 await expect(page.getByRole('button',{name:'Stop',exact:true})).toHaveCount(0);
});

test('a failing speech provider cannot prevent a bundled Filipino recording',async({page})=>{
 await mockSpeech(page);await mockClips(page);await reader(page,'fil');
 await page.evaluate(()=>{(speechSynthesis as any).getVoices=()=>{throw new Error('Voice provider not initialized');};});
 await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
 await expect(page.locator('.audio-wrap [role=status]').first()).toHaveText('Tumutugtog…');
 expect(await page.evaluate(()=>(window as any).clips.at(-1).src)).toBe('/audio/fil-apple.wav');
});

test('delayed local Filipino voice is discovered even without voiceschanged',async({page})=>{
 await mockSpeech(page);await reader(page,'fil');
 await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
 await page.evaluate(()=>{(speechSynthesis as any).voices=[{name:'Filipino fixture',lang:'fil-PH',localService:true,default:true}];});
 await expect(page.locator('.audio-wrap [role=status]').first()).toContainText('Handa na ang boses');
 expect(await page.evaluate(()=>(speechSynthesis as any).utterance)).toBeUndefined();
 await page.getByRole('button',{name:'Pakinggan',exact:true}).click();
 expect(await page.evaluate(()=>(speechSynthesis as any).utterance.text)).toBe('mansanas');
});
