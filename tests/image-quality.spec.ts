import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const assets=JSON.parse(readFileSync('src/data/assets.json','utf8'));

test('current student image declares its true dimensions and revision',async({page})=>{
 await page.goto('/roles');
 const student=page.getByRole('img',{name:'Student',exact:true});
 const asset=assets['characters/student'];
 await expect(student).toHaveJSProperty('naturalWidth',asset.width);
 await expect(student).toHaveAttribute('width',String(asset.width));
 await expect(student).toHaveAttribute('height',String(asset.height));
 await expect(student).toHaveAttribute('src',`${asset.src}?v=${asset.revision}`);
});

test('development clears only BasaBuddy static caches and keeps local data',async({page})=>{
 await page.goto('/roles');
 await page.evaluate(async()=>{
  await caches.open('basabuddy-static-obsolete');
  await caches.open('unrelated-cache-fixture');
  localStorage.setItem('image-audit-progress-fixture','keep');
 });
 await page.reload();
 await expect.poll(()=>page.evaluate(async()=> (await caches.keys()).includes('basabuddy-static-obsolete'))).toBe(false);
 expect(await page.evaluate(async()=> (await caches.keys()).includes('unrelated-cache-fixture'))).toBe(true);
 expect(await page.evaluate(()=>localStorage.getItem('image-audit-progress-fixture'))).toBe('keep');
});
