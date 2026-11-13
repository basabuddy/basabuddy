import {test,expect} from '@playwright/test';

test('selected language updates the whole interface and persists across pages and reloads',async({page})=>{
 await page.goto('/welcome');
 await page.evaluate(()=>{
  const key='basabuddy:v1';const data=JSON.parse(localStorage.getItem(key)||'{}');
  localStorage.setItem(key,JSON.stringify({...data,version:1,language:'en',profiles:[{id:'language-reader',name:'Luna',grade:'1'}],activeId:'language-reader',progress:{},assignments:[],quests:{},gameSessions:{},gameAwards:{},gameHistory:[]}));
 });
 await page.goto('/language');
 await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Filipino',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Piliin ang iyong landas sa pagbasa'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Magpatuloy',exact:true})).toBeVisible();
 await expect(page.getByText('May sariling paglalakbay sa pagbasa ang bawat wika.')).toBeVisible();
 await page.getByRole('button',{name:'Magpatuloy',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Handa nang magbasa?'})).toBeVisible();
 await expect(page.locator('.tabs')).toContainText('Bahay');
 await page.goto('/student/games/word-builder');
 await expect(page.getByRole('heading',{name:'Pagbuo ng Salita',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Simulan ang laro'})).toBeVisible();
 await page.goto('/signup');
 await expect(page.getByLabel('Iyong pangalan',{exact:true})).toBeVisible();
 await expect(page.getByLabel('Ulitin ang password',{exact:true})).toBeVisible();
 await page.goto('/student/settings');
 await expect(page.getByRole('heading',{name:'Mga Setting'})).toBeVisible();
 await page.getByRole('button',{name:'Ingles',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Settings',exact:true})).toBeVisible();
 await page.reload();
 await expect(page.getByRole('heading',{name:'Settings',exact:true})).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.goto('/student/games/word-builder');
 await expect(page.getByRole('button',{name:'Start game'})).toBeVisible();
 await expect(page.getByText('Tap letters in order to build the Filipino word. Use Undo or Reset to try again.')).toBeVisible();
 await page.getByRole('button',{name:'Start game'}).click();
 await expect(page.getByRole('button',{name:'Listen',exact:true})).toBeVisible();
 await page.goto('/login');
 await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();
 await expect(page.getByLabel('Account email')).toBeVisible();
});

test('Filipino covers dictionary dialogs, teacher controls, and secondary screens',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/welcome');
 await page.evaluate(()=>localStorage.setItem('basabuddy:v1',JSON.stringify({version:1,language:'fil',profiles:[{id:'reader',name:'Luna',grade:'1'}],activeId:'reader',progress:{},assignments:[],quests:{},gameSessions:{},gameAwards:{},gameHistory:[]})));
 for(const [route,heading] of [
  ['/roles','Sino ka?'],['/profiles','Piliin ang iyong mambabasa'],
  ['/student/rewards','Aking mga Gantimpala'],['/student/coach','Gabay sa Pagbasa'],
  ['/student/adventure','Isla ng Pakikipagsapalaran'],['/student/premium','Mga susunod na tampok sa pagkatuto'],
  ['/missing','Hindi nahanap ang pahina'],
 ]){await page.goto(route);await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();}
 await page.goto('/student/dictionary');
 await page.getByRole('button',{name:'Pagsasanay sa mga kard'}).click();
 await expect(page.getByRole('dialog')).toContainText('Mga kard ng salita');
 await expect(page.getByRole('button',{name:'Isara ang pagsasanay'})).toBeVisible();
 await page.getByRole('button',{name:'Isara ang pagsasanay'}).click();
 await page.goto('/adult/teacher');
 await page.getByLabel('PIN ng guro',{exact:true}).fill('2468');
 await page.getByLabel('Ulitin ang PIN',{exact:true}).fill('2468');
 await page.getByRole('button',{name:'I-save ang PIN at magpatuloy'}).click();
 await expect(page.getByRole('button',{name:'pangkalahatang tanaw',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'magtalaga',exact:true}).click();
 await expect(page.getByRole('button',{name:'Magtalaga ng aralin',exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});

test('welcome page offers interface language before onboarding',async({page})=>{
 await page.goto('/welcome');
 const picker=page.getByRole('group',{name:'Wika ng interface'});
 await expect(picker).toBeVisible();
 await expect(picker.getByRole('button',{name:'Filipino',exact:true})).toHaveAttribute('aria-pressed','true');
 await picker.getByRole('button',{name:'Ingles',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Little Steps. Big Reading Adventures.'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Get Started',exact:true})).toBeVisible();
 await page.reload();
 await expect(page.getByRole('group',{name:'Interface language'}).getByRole('button',{name:'English',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Get Started',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Who are you?'})).toBeVisible();
 await page.goto('/welcome');
 await page.getByRole('button',{name:'Filipino',exact:true}).click();
 await expect(page.getByRole('button',{name:'Magsimula',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Gumawa ng account',exact:true})).toBeVisible();
});
