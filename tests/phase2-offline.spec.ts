import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join} from 'node:path';

test('built app resumes and completes a game offline after its first cache installation',async({page,context})=>{
 test.setTimeout(60000);
 const mime:Record<string,string>={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.wav':'audio/wav','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff'};
 const server=createServer(async(req,res)=>{const path=new URL(req.url!,'http://localhost').pathname;try{const filename=extname(path)?path:'/index.html';res.setHeader('Content-Type',mime[extname(filename)]??'application/octet-stream');res.end(await readFile(join(process.cwd(),'dist',filename)));}catch{res.statusCode=404;res.end();}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const port=(server.address() as {port:number}).port;
 try{
  await page.goto(`http://127.0.0.1:${port}/`);await page.evaluate(()=>navigator.serviceWorker.ready);await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await page.evaluate(()=>localStorage.setItem('basabuddy:v1',JSON.stringify({version:1,profiles:[{id:'offline',name:'Reader',grade:'1'}],activeId:'offline',language:'fil',progress:{},assignments:[],quests:{}})));
  await page.goto(`http://127.0.0.1:${port}/student/games/picture-match`);await page.getByRole('button',{name:'Start game'}).click();await page.getByRole('button',{name:'pusa',exact:true}).click();
  await context.setOffline(true);await page.reload();await expect(page.getByRole('status').filter({hasText:'Offline'})).toBeVisible();await page.getByRole('button',{name:'Continue game'}).click();await expect(page.getByRole('button',{name:'pusa',exact:true})).toHaveAttribute('aria-pressed','true');
  for(const [i,word] of ['pusa','aso','ibon'].entries()){await page.getByRole('button',{name:word,exact:true}).click();await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.getByRole('button',{name:i===2?'Finish level':'Next word',exact:true}).click();}
  await expect(page.getByRole('heading',{name:'Ang husay mo! 🌟'})).toBeVisible();await page.reload();await page.getByRole('button',{name:'See saved result'}).click();await expect(page.getByRole('heading',{name:'Ang husay mo! 🌟'})).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('basabuddy:v1')!));expect(saved.gameHistory).toHaveLength(1);expect(Object.values(saved.gameAwards)).toHaveLength(1);
  await page.goto(`http://127.0.0.1:${port}/student/dictionary`);await page.getByRole('button',{name:'Lahat',exact:true}).click();await expect(page.locator('.dictionary-grid > button')).toHaveCount(90);
  const decoded=await page.locator('.dictionary-grid img').evaluateAll(async imgs=>{await Promise.all(imgs.map(async el=>{const im=el as HTMLImageElement;im.loading='eager';await im.decode();}));return imgs.every(el=>(el as HTMLImageElement).naturalWidth>0);});expect(decoded).toBe(true);
  await page.getByRole('button',{name:'Aso Dog',exact:true}).click();await page.getByRole('button',{name:'Favorite word',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:'Favorites (1)',exact:true})).toBeVisible();

 }finally{await context.setOffline(false);await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
