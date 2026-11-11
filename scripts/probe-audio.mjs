// Unmocked browser capability inspection. Does not speak or send lesson text.
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:5173/welcome');
 const capabilities=await page.evaluate(async()=>{
  const synth=window.speechSynthesis;
  if(!synth)return {supported:false,voices:[]};
  // Allow asynchronous voice discovery, checking both the event and polling.
  let events=0;const changed=()=>events++;
  synth.addEventListener('voiceschanged',changed);
  for(let attempt=0;attempt<20;attempt++){synth.getVoices();await new Promise(resolve=>setTimeout(resolve,250));}
  const voices=synth.getVoices().map(({name,lang,localService,default:isDefault})=>({name,lang,localService,isDefault}));
  synth.removeEventListener('voiceschanged',changed);
  return {supported:true,voiceEvents:events,voices};
 });
 const result={browser:browser.version(),environment:'Unmocked Playwright Chromium on this computer; not the user’s phone/browser',waitedMs:5000,...capabilities,audibleVerification:false};
 await writeFile('docs/audio-browser-probe.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({browser:result.browser,totalVoices:result.voices.length,filipinoVoices:result.voices.filter(v=>/^(fil|tl)(-|$)/i.test(v.lang)),defaultVoice:result.voices.find(v=>v.isDefault),audibleVerification:false},null,2));
}finally{await browser.close();}
