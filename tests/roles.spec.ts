import {test,expect} from '@playwright/test';

test('only Student and Teacher can be selected, and obsolete entry routes do not resolve',async({page})=>{
 await page.goto('/roles');
 await expect(page.locator('.role-list button')).toHaveCount(2);
 await expect(page.locator('.role-list h2')).toHaveText(['Student','Teacher']);
 for(const route of ['/adult/parent','/parent/login','/parent/home','/parent/report','/guardian','/adult/unknown']){
  await page.goto(route);await expect(page.getByRole('heading',{name:'Page not found',exact:true})).toBeVisible();
  await expect(page.locator('input[type=password]')).toHaveCount(0);
 }
});

test('additional students onboard without account management and retain independent progress',async({page})=>{
 await page.goto('/profiles');await page.getByLabel('Nickname').fill('Ana');await page.getByRole('button',{name:'Let’s read!'}).click();
 await page.getByRole('button',{name:'English',exact:true}).click();await page.getByRole('button',{name:'Continue · Magpatuloy'}).click();
 await page.goto('/student/games/word-builder');await page.getByRole('button',{name:'Start game'}).click();await page.getByRole('button',{name:'p, tile 4',exact:true}).click();
 const original=await page.evaluate(()=>JSON.parse(localStorage.getItem('basabuddy:v1')!));
 await page.goto('/profiles');await expect(page.getByRole('button',{name:/Ana Grade 1/})).toBeVisible();await page.getByLabel('Nickname').fill('Ben');await page.getByRole('button',{name:'Let’s read!'}).click();
 await page.goto('/student/home');await expect(page.getByText('Hello, Ben!')).toBeVisible();await page.goto('/student/rewards');await expect(page.getByRole('heading',{name:'0 learning stars'})).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('basabuddy:v1')!));expect(saved.profiles).toHaveLength(2);expect(saved.gameSessions).toEqual(original.gameSessions);expect(saved.progress).toEqual(original.progress);
});

test('teacher works with an empty device, assigns and removes work, and locks on exit',async({page})=>{
 await page.goto('/adult/teacher');await page.getByLabel('Teacher PIN',{exact:true}).fill('2468');await page.getByLabel('Confirm PIN').fill('2468');await page.getByRole('button',{name:'Save PIN and continue'}).click();
 await expect(page.getByRole('heading',{name:'No learners yet'})).toBeVisible();await page.getByRole('link',{name:'Student onboarding'}).click();
 await page.getByLabel('Nickname').fill('Luna');await page.getByRole('button',{name:'Let’s read!'}).click();await page.goto('/adult/teacher');await expect(page.getByText('Enter your teacher PIN')).toBeVisible();
 await page.getByLabel('Teacher PIN',{exact:true}).fill('2468');await page.getByRole('button',{name:'Open teacher area'}).click();
 await page.getByRole('button',{name:'assign',exact:true}).click();await page.getByRole('button',{name:'Assign lesson',exact:true}).click();await expect(page.getByRole('status')).toContainText('Lesson assigned!');
 await page.getByRole('button',{name:'Remove assignment',exact:true}).click();await expect(page.getByRole('button',{name:'Remove assignment',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Lock teacher area'}).click();await expect(page.getByLabel('Teacher PIN',{exact:true})).toBeVisible();
});
