// Validate real local illustration files; never create placeholders.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dictionaryEntries} from '../src/dictionary/content.ts';
const root=new URL('../',import.meta.url),errors=[],records=[],hashes=new Map();
if(dictionaryEntries.length!==90)errors.push('Expected exactly 90 entries');
for(const [category,count] of [['animals',25],['food',25],['things',40]])if(dictionaryEntries.filter(e=>e.category===category).length!==count)errors.push('Wrong count: '+category);
if(new Set(dictionaryEntries.map(e=>e.id)).size!==90)errors.push('Duplicate IDs');
for(const e of dictionaryEntries){
 let bytes,sha256,source;
 try{bytes=await readFile(new URL('public'+e.image,root));if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Not WebP');sha256=createHash('sha256').update(bytes).digest('hex');if(hashes.has(sha256))errors.push(`Repeated illustration ${e.id} and ${hashes.get(sha256)}`);hashes.set(sha256,e.id);source=JSON.parse(await readFile(new URL(`reference/dictionary-generation/${e.id}.json`,root),'utf8'));if(source.sha256!==sha256)throw Error('Stale illustration revision');if(!source.width||!source.height)throw Error('Missing image dimensions');}catch(error){errors.push(`${e.id}: ${error.message}`);}
 records.push({id:e.id,filipino:e.filipino,english:e.english,image:e.image,bytes:bytes?.length,sha256,source:source?.method,review:source?.review,filipinoAudio:e.filipinoAudio??null,englishAudio:e.englishAudio??null,filipinoVoiceFallback:'fil-PH or local tl voice only',englishVoiceFallback:'en-US or local en voice only'});
}
const report={entries:dictionaryEntries.length,illustrations:records.filter(r=>r.sha256).length,errors,missingFilipinoRecordings:records.filter(r=>!r.filipinoAudio).map(r=>({id:r.id,text:r.filipino})),missingEnglishRecordings:records.filter(r=>!r.englishAudio).map(r=>({id:r.id,text:r.english})),records};
if(process.argv.includes('--write'))await writeFile(new URL('docs/DICTIONARY_ASSET_AUDIO_REPORT.json',root),JSON.stringify(report,null,2)+'\n');
console.log(`Dictionary: ${report.entries} entries; ${report.illustrations} local WebP files; ${errors.length} errors. Missing bundled word recordings: Filipino ${report.missingFilipinoRecordings.length}, English ${report.missingEnglishRecordings.length}. Matching local browser voices are used when available; this is not a pronunciation review.`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
