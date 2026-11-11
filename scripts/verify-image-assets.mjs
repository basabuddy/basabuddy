// Prevent a replaced image from shipping under stale dimensions/content revisions.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const assets=JSON.parse(await readFile(new URL('../src/data/assets.json',import.meta.url),'utf8'));
const errors=[];
for(const asset of Object.values(assets).flatMap(a=>[a,...(a.variants||[])])){
 try{
  const bytes=await readFile(new URL('../public'+asset.src,import.meta.url));
  const revision=createHash('sha256').update(bytes).digest('hex').slice(0,16);
  if(revision!==asset.revision||bytes.length!==asset.bytes)errors.push(asset.src);
 }catch{errors.push(asset.src);}
}
if(errors.length)throw new Error(`Missing or changed image assets: ${[...new Set(errors)].join(', ')}. Check the files, then run npm run sync:images and npm run audit:images.`);
console.log(`Verified image content revisions for ${Object.keys(assets).length} logical assets.`);
