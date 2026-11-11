// Local-only inventory of text actually passed to audio controls. Never generates audio.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {lessonBank,dictionary} from '../src/content/lessons.ts';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('src/audio/manifest.json',root)));
const checklist={},errors=[],fileCache=new Map();
const digest=text=>createHash('sha256').update(text).digest('hex');
const validPath=path=>/^\/audio\/[a-zA-Z0-9_-]+\.(mp3|wav|ogg|m4a)$/.test(path);
async function inspect(path){
 if(fileCache.has(path))return fileCache.get(path);
 let result;
 try{
  if(!validPath(path))throw Error('invalid local audio path');
  const data=await readFile(new URL('public'+path,root));
  const wav=data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WAVE';
  const recognized=data.length>44&&(wav||data.toString('ascii',0,3)==='ID3'||(data[0]===255&&(data[1]&224)===224)||data.toString('ascii',0,4)==='OggS'||data.toString('ascii',4,8)==='ftyp');
  if(!recognized)throw Error('unrecognized or empty audio');
  result={valid:true,bytes:data.length,sha256:digest(data)};
  if(wav){
   if(data.readUInt32LE(4)+8>data.length)throw Error('truncated RIFF');
   let format,pcmBytes;
   for(let offset=12;offset+8<=data.length;){
    const tag=data.toString('ascii',offset,offset+4),size=data.readUInt32LE(offset+4),start=offset+8;
    if(start+size>data.length)throw Error('truncated WAV chunk');
    if(tag==='fmt '&&size>=16)format={codec:data.readUInt16LE(start),channels:data.readUInt16LE(start+2),sampleRate:data.readUInt32LE(start+4),byteRate:data.readUInt32LE(start+8),blockAlign:data.readUInt16LE(start+12),bits:data.readUInt16LE(start+14)};
    if(tag==='data')pcmBytes=size;
    offset=start+size+(size%2);
   }
   if(!format||!pcmBytes||!format.byteRate||!format.blockAlign||pcmBytes%format.blockAlign)throw Error('invalid WAV format/data');
   result={...result,...format,durationSeconds:pcmBytes/format.byteRate};
  }
 }catch(error){result={valid:false,error:error.message};}
 fileCache.set(path,result);return result;
}
// Practice.tsx AudioControls: no individual puzzle tiles or choice labels speak on tap.
const practice={
 fil:{repeat:['mansanas'],aloud:['Ang pusa ay maliit.'],word:['pusa','aso','ibon'],story:['Si Ana ay may pusa. Mabait ang pusa ni Ana. Masaya silang maglaro.'],sentence:['Ang pusa ay maliit.'],puzzle:['ba ta'],find:['aso']},
 en:{repeat:['apple'],aloud:['The cat is little.'],word:['cat','dog','bird'],story:['Ana has a cat. Her cat is kind. They are happy when they play together.'],sentence:['The cat is little.'],puzzle:['c a t'],find:['dog']},
};
for(const lang of ['fil','en']){
 const entries=new Map();
 const add=(text,location)=>{
  // Exact text/language identity; keep punctuation, case and syllable spaces.
  // Normal and Slow share a clip. Do not equate segmented "ba ta" with "bata".
  if(!entries.has(text))entries.set(text,{text,language:lang,locations:[]});
  entries.get(text).locations.push(location);
 };
 const both=lang==='fil'?['Pakinggan','Dahan-dahan']:['Listen','Slow'];
 const listen=[both[0]];
 for(const [screen,texts] of Object.entries(practice[lang]))texts.forEach((text,i)=>add(text,{source:'src/app/Practice.tsx',route:'/student/practice/'+screen,screen,stage:screen==='word'?`word ${i+1}`:'practice',buttons:both,...(['word','aloud','story'].includes(screen)?{alsoReachedFrom:'/student/daily → '+screen+'?quest=1'}:{})}));
 for(const lesson of lessonBank[lang]){
  const route=`/learn/${lang}/${lesson.id}`,base={source:'src/app/Lesson.tsx',route,lessonId:lesson.id,lessonTitle:lesson.title};
  // Passage replaces the model on the practice audio control.
  add(lesson.passage??lesson.model,{...base,stage:'practice (step 1)',buttons:both});
  lesson.questions.forEach((item,i)=>{
   const q={...base,questionId:item.id,question:i+1,prompt:item.prompt};
   if(item.audio)add(item.audio,{...q,stage:'assessment prompt',buttons:listen});
   // Wrong answer → Check → Practice the answer → Listen.
   add(item.answer,{...q,stage:'incorrect-answer feedback → Practice the answer',buttons:listen});
  });
 }
 dictionary.forEach(item=>add(item[lang==='fil'?1:2],{source:'src/app/Student.tsx',route:'/student/dictionary',screen:'Picture Dictionary',category:item[3],select:item[lang==='fil'?1:2],stage:'select picture',buttons:listen}));
 checklist[lang]=[];
 for(const entry of entries.values()){
  const mapped=manifest[lang]?.[entry.text];
  const file=mapped?await inspect(mapped):null;
  checklist[lang].push({...entry,path:mapped??`/audio/${lang}-${digest(entry.text).slice(0,16)}.${lang==='fil'?'wav':'mp3'}`,bundled:!!file?.valid,status:file?.valid?'covered':mapped?'invalid-recording':'missing',...(file?{file}:{}),...(lang==='fil'?{pronunciationReview:'Pending native-speaker review'}:{})});
 }
 for(const [text,path] of Object.entries(manifest[lang]??{})){
  const file=await inspect(path);
  if(!file.valid)errors.push(`${lang}: ${JSON.stringify(text)} → ${path}: ${file.error}`);
  if(!path.startsWith(`/audio/${lang}-`))errors.push(`${lang}: ${JSON.stringify(text)} → ${path}: filename language does not match mapping`);
  if(!entries.has(text))errors.push(`${lang}: manifest text not reachable by an audio control: ${JSON.stringify(text)}`);
 }
 const covered=checklist[lang].filter(x=>x.bundled).length;
 console.log(`${lang}: ${covered}/${entries.size} unique playable texts covered; ${entries.size-covered} missing.`);
}
let files=[];
try{files=(await readdir(new URL('public/audio/',root))).filter(f=>/\.(wav|mp3|ogg|m4a)$/.test(f)).map(f=>'/audio/'+f);}catch(error){if(error.code!=='ENOENT')throw error;}
const mappedPaths=new Set(Object.values(manifest).flatMap(m=>Object.values(m)));
const unreferencedFiles=files.filter(path=>!mappedPaths.has(path));
if(unreferencedFiles.length)console.log('Unreferenced files (verify content before mapping):',unreferencedFiles);
const filesByHash=new Map();
for(const path of files){
 const file=await inspect(path);
 if(!file.valid)errors.push(`${path}: ${file.error}`);
 else filesByHash.set(file.sha256,[...(filesByHash.get(file.sha256)??[]),path]);
}
const duplicateFiles=[...filesByHash.values()].filter(paths=>paths.length>1);
if(duplicateFiles.length)console.log('Byte-identical audio files:',duplicateFiles);
if(process.argv.includes('--write-checklist')){
 await writeFile(new URL('docs/audio-recording-checklist.json',root),JSON.stringify(checklist,null,2)+'\n');
 const fil=checklist.fil,covered=fil.filter(x=>x.bundled).length;
 const cell=x=>String(x).replaceAll('|','\\|').replaceAll('\n',' ');
 const rows=fil.map((x,i)=>`| ${i+1} | ${cell(JSON.stringify(x.text))} | ${x.status} | ${x.locations.map(l=>cell(l.lessonId?`${l.lessonId} ${l.lessonTitle} — ${l.stage}${l.question?` Q${l.question}`:''}`:`${l.route} — ${l.stage}${l.select?` (${l.select})`:''}`)).join('<br>')} |`);
 const report=`# Filipino offline recording checklist\n\n${fil.length} unique playable texts: **${covered} covered, ${fil.length-covered} missing**. Generated by the local audit, not by a speech service.\n\nPronunciation review by a fluent Filipino speaker is still required. This audit validates file structure and exact text-to-file mappings; it does not judge spoken pronunciation. No audio files were generated, modified, or replaced.\n\n## Scope and deduplication\n\nExact text passed to AudioControls/AudioButton in Practice.tsx, Lesson.tsx and Student.tsx. Includes all 18 Filipino lessons, all seven practice modes, daily-quest practice links, seven dictionary items, assessment audio and incorrect-answer feedback. StoryArt is visual only. Prompts and choice/tile labels without an audio control are excluded; answer text is included because the feedback Listen button can read it. Numbers and longer story passages are included for the same reason.\n\nRepeated exact text in the same language is one recording with all locations listed. Listen and Slow share that recording (Slow uses playbackRate 0.75, preservesPitch true). Case, punctuation and segmentation are retained to avoid changing pronunciation or exact-key lookup. No speculative text aliases were added. The JSON companion includes exact route, lesson title, question number/prompt, button availability, file path and validated file metadata. Proposed paths for missing text do not represent files that exist.\n\nTo hear a feedback recording: give an incorrect answer, press Suriin ang sagot, then Magsanay sa tamang sagot, then Pakinggan. Practice screens offer Pakinggan and Dahan-dahan; dictionary and assessment/feedback currently offer Pakinggan only. Choose Filipino before opening language-neutral student routes.\n\n## Recordings\n\n| # | Exact text (JSON quoted) | Status | Lesson or screen locations |\n|---|---|---|---|\n${rows.join('\n')}\n\n## File audit\n\nManifest/file errors: ${errors.length}. Unreferenced public audio files: ${unreferencedFiles.length}. Byte-identical duplicate groups: ${duplicateFiles.length}. Covered requires a valid mapped file, not just a manifest entry. No recordings were generated or replaced by this audit.\n`;
 await writeFile(new URL('docs/FILIPINO_RECORDING_CHECKLIST.md',root),report);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
if(process.argv.includes('--require-complete')&&Object.values(checklist).flat().some(x=>!x.bundled)){console.error('Narration is incomplete. See docs/audio-recording-checklist.json.');process.exitCode=1;}
