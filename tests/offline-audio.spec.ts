import {test,expect} from '@playwright/test';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';

test('production worker caches audio for offline reload, decoding and range requests',async({page,context})=>{
 // Silence is a transport/decoder fixture, never a lesson recording.
 const root=await mkdtemp(join(tmpdir(),'basabuddy-offline-'));
 await mkdir(join(root,'audio'));
 const wav=Buffer.alloc(44+16000);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);
 await writeFile(join(root,'audio/test.wav'),wav);
 await writeFile(join(root,'index.html'),`<!doctype html><title>Offline test fixture</title><button onclick="document.querySelector('audio').play().then(()=>document.querySelector('output').textContent='playing')">Play</button><output></output><audio src="/audio/test.wav"></audio><script>navigator.serviceWorker.register('/sw.js')</script>`);
 execFileSync(process.execPath,['scripts/build-offline.mjs',root]);
 const server=createServer(async(req,res)=>{try{const path=new URL(req.url!,'http://localhost').pathname;const file=path==='/'?'/index.html':path;res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.wav')?'audio/wav':'text/html');res.end(await readFile(join(root,file)));}catch{res.statusCode=404;res.end();}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=server.address() as {port:number};
 try{
  await page.goto(`http://127.0.0.1:${address.port}/`);
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);await page.reload();
  await page.getByRole('button',{name:'Play',exact:true}).click();
  await expect(page.locator('output')).toHaveText('playing');
  expect(await page.locator('audio').evaluate((a:HTMLAudioElement)=>a.duration)).toBe(1);
  expect(await page.evaluate(async()=>{const r=await fetch('/audio/test.wav',{headers:{Range:'bytes=12-31'}});return {status:r.status,size:(await r.arrayBuffer()).byteLength,range:r.headers.get('content-range')};})).toEqual({status:206,size:20,range:'bytes 12-31/16044'});
  expect(await page.evaluate(async()=> (await fetch('/audio/test.wav',{headers:{Range:'bytes=99999-'}})).status)).toBe(416);
 }finally{await context.setOffline(false);await new Promise<void>(resolve=>server.close(()=>resolve()));await rm(root,{recursive:true,force:true});}
});

test('production worker activates changed image bytes in an open tab and keeps them offline',async({page,context})=>{
 const root=await mkdtemp(join(tmpdir(),'basabuddy-image-cache-'));
 await mkdir(join(root,'assets'));
 const oldImage=await readFile('public/assets/characters/teacher.webp');
 const newImage=await readFile('public/assets/characters/student.webp');
 const revision=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex').slice(0,16);
 await writeFile(join(root,'assets/test.webp'),oldImage);
 await writeFile(join(root,'index.html'),'<!doctype html><title>Image cache fixture</title><script>navigator.serviceWorker.register("/sw.js",{updateViaCache:"none"})</script>');
 execFileSync(process.execPath,['scripts/build-offline.mjs',root]);
 const server=createServer(async(req,res)=>{
  try{
   const path=new URL(req.url!,'http://localhost').pathname;
   res.setHeader('Cache-Control','no-store');
   res.setHeader('Content-Type',path.endsWith('.js')?'application/javascript':path.endsWith('.webp')?'image/webp':'text/html');
   res.end(await readFile(join(root,path==='/'?'index.html':path)));
  }catch{res.statusCode=404;res.end();}
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=server.address() as {port:number};
 const digest=async(version:string)=>page.evaluate(async v=>{
  const bytes=await (await fetch('/assets/test.webp?v='+v)).arrayBuffer();
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);
 },version);
 try{
  await page.goto(`http://127.0.0.1:${address.port}/`);
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await page.evaluate(()=>localStorage.setItem('learner-progress-fixture','preserved'));
  expect(await digest(revision(oldImage))).toBe(revision(oldImage));
  await writeFile(join(root,'assets/test.webp'),newImage);
  // Even before a new worker installs, a different revision must reach the network.
  expect(await digest(revision(newImage))).toBe(revision(newImage));
  execFileSync(process.execPath,['scripts/build-offline.mjs',root]);
  await page.evaluate(async()=>{
   const registration=await navigator.serviceWorker.ready;
   const changed=new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));
   await registration.update();await changed;
  });
  await context.setOffline(true);
  expect(await digest(revision(newImage))).toBe(revision(newImage));
  expect(await page.evaluate(()=>localStorage.getItem('learner-progress-fixture'))).toBe('preserved');
  await expect.poll(()=>page.evaluate(async()=> (await caches.keys()).filter(k=>k.startsWith('basabuddy-static-')).length)).toBe(1);
 }finally{await context.setOffline(false);await new Promise<void>(resolve=>server.close(()=>resolve()));await rm(root,{recursive:true,force:true});}
});

test('online signup navigation uses the new release while offline fallback preserves the installed pack and account data',async({page,context})=>{
 const root=await mkdtemp(join(tmpdir(),'basabuddy-signup-cache-'));
 const oldHtml='<!doctype html><title>Signup cache fixture</title><h1>Old signup</h1><script>navigator.serviceWorker.register("/sw.js",{updateViaCache:"none"})</script>';
 await writeFile(join(root,'index.html'),oldHtml);
 execFileSync(process.execPath,['scripts/build-offline.mjs',root]);
 const server=createServer(async(req,res)=>{
  const path=new URL(req.url!,'http://localhost').pathname;
  try{
   res.setHeader('Cache-Control','no-store');
   if(path==='/sw.js'){res.setHeader('Content-Type','application/javascript');res.end(await readFile(join(root,'sw.js')));return;}
   res.setHeader('Content-Type','text/html');
   if(path!=='/'&&path!=='/index.html')res.statusCode=404;
   res.end(await readFile(join(root,'index.html')));
  }catch{res.statusCode=500;res.end();}
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
 try{
  await page.goto(origin);await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await page.evaluate(()=>localStorage.setItem('account-data-fixture','keep my readers'));
  // The old worker is still active, but the server now has the new signup page.
  await writeFile(join(root,'index.html'),'<!doctype html><title>New signup</title><div id="root"><h1>Choose your role</h1><label><input type="radio" name="role">Student</label><label><input type="radio" name="role">Teacher</label></div>');
  await page.goto(origin+'/signup');await expect(page.getByRole('heading',{name:'Choose your role'})).toBeVisible();await expect(page.getByRole('radio',{name:'Teacher'})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('account-data-fixture'))).toBe('keep my readers');
  await context.setOffline(true);await page.reload();await expect(page.getByRole('heading',{name:'Old signup'})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('account-data-fixture'))).toBe('keep my readers');
 }finally{await context.setOffline(false);server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await rm(root,{recursive:true,force:true});}
});
