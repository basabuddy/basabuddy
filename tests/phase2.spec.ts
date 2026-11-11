import {test,expect,type Page} from '@playwright/test';
import {games,roundsFor,tilesFor,type GameId,type Difficulty} from '../src/games/model';
import {studentNavigation} from '../src/app/navigation';
const seed={version:1,profiles:[{id:'a',name:'Ana',grade:'2'},{id:'b',name:'Ben',grade:'1'}],activeId:'a',language:'en',progress:{},assignments:[],quests:{}};
async function setup(page:Page){await page.goto('/');await page.evaluate(d=>localStorage.setItem('basabuddy:v1',JSON.stringify(d)),seed);await page.goto('/student/home');}
async function solve(page:Page,game:GameId,difficulty:Difficulty,round:number){const item=roundsFor(game,difficulty)[round];if(game==='picture-match')await page.getByRole('button',{name:item.word,exact:true}).click();else{const tiles=tilesFor(game,item);const used:number[]=[];for(const token of game==='word-builder'?[...item.word]:item.syllables){const i=tiles.findIndex((t,i)=>t===token&&!used.includes(i));used.push(i);await page.getByRole('button',{name:`${token}, tile ${i+1}`,exact:true}).click();}}await page.getByRole('button',{name:'Check answer',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Tama!'})).toBeVisible();}

test('home restores the original four tabs and keeps student navigation separate from teacher entry',async({page})=>{await setup(page);await expect(page.getByText('Hello, Ana! ☀️')).toBeVisible();await expect(page.locator('.buddy-card')).toBeVisible();await expect(page.locator('.shortcuts button')).toHaveCount(3);await expect(page.locator('.dashboard')).toHaveCount(0);for(const item of studentNavigation){await page.getByRole('navigation',{name:'Student navigation'}).getByRole('link',{name:item.label,exact:true}).click();await expect(page).toHaveURL(new RegExp(`/student/${item.path}$`));await expect(page.locator('h1').first()).toBeVisible();}await page.goto('/roles');await page.getByRole('button',{name:'Teacher I want to help my class'}).click();await expect(page.getByLabel('Teacher PIN',{exact:true})).toBeVisible();await page.goto('/student/premium');await expect(page.getByRole('heading',{name:'Coming soon',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:/buy|subscribe|pay/i})).toHaveCount(0);});

for(const definition of games)test(`${definition.title}: all difficulty levels play, reload and reward once`,async({page})=>{
 await setup(page);await page.goto(`/student/games/${definition.id}`);
 for(const level of ['beginner','growing','challenge'] as Difficulty[]){await page.getByRole('radio',{name:new RegExp(level,'i')}).check();await page.getByRole('button',{name:'Start game',exact:true}).click();
  // Wrong answers show helpful feedback and remain editable.
  if(level==='beginner'){
   if(definition.id==='picture-match'){const item=roundsFor(definition.id,level)[0];const choices=page.locator('.game-play .choices button');for(let i=0;i<await choices.count();i++)if(await choices.nth(i).innerText()!==item.word){await choices.nth(i).click();break;}}
   else {const tiles=page.locator('.game-play .chips button');for(let i=0;i<await tiles.count();i++)await tiles.nth(i).click();}
   await page.getByRole('button',{name:'Check answer',exact:true}).click();await expect(page.getByRole('status')).toContainText('Good try!');
   if(definition.id!=='picture-match')await page.getByRole('button',{name:'Reset word'}).click();
  }
  for(let round=0;round<3;round++){
   await solve(page,definition.id,level,round);
   if(round===0){await page.reload();await page.getByRole('radio',{name:new RegExp(level,'i')}).check();await page.getByRole('button',{name:'Continue game',exact:true}).click();await expect(page.getByRole('status')).toContainText('Tama!');}
   await page.getByRole('button',{name:round===2?'Finish level':'Next word',exact:true}).click();
  }
  await expect(page.getByRole('heading',{name:'Ang husay mo! 🌟'})).toBeVisible();await page.getByRole('button',{name:'Replay level'}).click();
  for(let round=0;round<3;round++){await solve(page,definition.id,level,round);await page.getByRole('button',{name:round===2?'Finish level':'Next word',exact:true}).click();}
  await page.getByRole('button',{name:'Choose another level'}).click();
 }
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('basabuddy:v1')!));expect(saved.gameHistory).toHaveLength(6);expect(Object.values(saved.gameAwards).reduce((n:number,a:any)=>n+a.stars,0)).toBe(9);
 await page.goto('/student/rewards');await expect(page.getByRole('heading',{name:'9 learning stars'})).toBeVisible();
 await page.goto('/profiles');await page.getByRole('button',{name:/Ben/}).click();await page.goto('/student/rewards');await expect(page.getByRole('heading',{name:'0 learning stars'})).toBeVisible();
});

test('partial game tile selection survives reload and keyboard controls work',async({page})=>{await setup(page);await page.goto('/student/games/word-builder');await page.getByRole('button',{name:'Start game'}).click();const tile=page.getByRole('button',{name:'p, tile 4',exact:true});await tile.focus();await page.keyboard.press('Enter');await expect(page.getByLabel('Your word')).toHaveText('p');await page.reload();await page.getByRole('button',{name:'Continue game'}).click();await expect(page.getByLabel('Your word')).toHaveText('p');await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByLabel('Your word')).toHaveText('…');});

test('new screens fit mobile, tablet and desktop with real images and reduced motion',async({page})=>{test.setTimeout(90000);await setup(page);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});for(const width of [320,393,768,1440]){await page.setViewportSize({width,height:900});for(const route of ['home','games','adventure','coach','rewards','progress','premium',...games.map(g=>'games/'+g.id)]){await page.goto('/student/'+route);await expect(page.locator('h1').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const broken=await page.locator('main img').evaluateAll(async imgs=>{await Promise.all(imgs.map(async el=>{const img=el as HTMLImageElement;img.loading='eager';try{await img.decode();}catch{}}));return imgs.filter(el=>!(el as HTMLImageElement).naturalWidth).length;});expect(broken).toBe(0);if(route.startsWith('games/')){await page.getByRole('radio',{name:'Challenge',exact:true}).check();await page.getByRole('button',{name:/^(Start game|Continue game)$/}).click();await expect(page.getByRole('button',{name:'Check answer',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);if(route==='games/word-builder')await page.screenshot({path:`test-results/phase2-game-${width}.png`,fullPage:true});}if(route==='home')await page.screenshot({path:`test-results/phase2-home-${width}.png`,fullPage:true});}}expect(errors).toEqual([]);});


test('teacher retains real learner exports without account-management tabs',async({page})=>{
 await setup(page);await page.goto('/student/games/picture-match');await page.getByRole('button',{name:'Start game'}).click();
 for(let round=0;round<3;round++){await solve(page,'picture-match','beginner',round);await page.getByRole('button',{name:round===2?'Finish level':'Next word',exact:true}).click();}
 await page.goto('/adult/teacher');await page.getByLabel('Teacher PIN',{exact:true}).fill('2468');await page.getByLabel('Confirm PIN').fill('2468');await page.getByRole('button',{name:'Save PIN and continue'}).click();await page.getByRole('button',{name:'reports',exact:true}).click();
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export learner report',exact:true}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('basabuddy-learner-progress.json');
 const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(Buffer.from(chunk));const report=JSON.parse(Buffer.concat(chunks).toString());expect(report.profile.id).toBe('a');expect(report.gameHistory).toHaveLength(1);expect(report.gameAwards).toHaveLength(1);
 await expect(page.getByRole('button',{name:'data',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:/Delete this learner/})).toHaveCount(0);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('basabuddy:v1')!));expect(saved.profiles.map((p:any)=>p.id)).toEqual(['a','b']);expect(saved.gameHistory).toHaveLength(1);
});
