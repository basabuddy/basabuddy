import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const password='ReadingStars123!';
async function signup(page:Page,email='parent@example.com',name='Parent Ana'){
 await page.goto('/signup');
 await page.getByLabel('Your name',{exact:true}).fill(name);
 await page.getByLabel('Parent email',{exact:true}).fill(email);
 await page.getByLabel('Password',{exact:true}).fill(password);
 await page.getByLabel('Confirm password',{exact:true}).fill(password);
 await page.getByRole('button',{name:'Create account',exact:true}).click();
 await expect(page).toHaveURL(/\/profiles$/);
}
async function login(page:Page,email='parent@example.com',pass=password){
 await page.goto('/login');
 await page.getByLabel('Parent email',{exact:true}).fill(email);
 await page.getByLabel('Password',{exact:true}).fill(pass);
 await page.getByRole('button',{name:'Log in',exact:true}).click();
}
async function addReader(page:Page,name:string){
 await page.getByLabel('Nickname',{exact:true}).fill(name);
 await page.getByRole('button',{name:'Let’s read!',exact:true}).click();
}
async function logout(page:Page){await page.goto('/account');await page.getByRole('button',{name:'Log out',exact:true}).click();await expect(page).toHaveURL(/\/login$/);}

test('signup, profile photo, session reload, logout, login, and scoped progress work together',async({page})=>{
 await page.goto('/profiles');await addReader(page,'Guest reader');
 const guest=await page.evaluate(()=>localStorage.getItem('basabuddy:v1'));
 await signup(page);await expect(page.getByText('Parent Ana',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:/Guest reader Grade/})).toHaveCount(0);
 await addReader(page,'Luna');await page.goto('/account');
 await page.getByLabel('Choose profile photo').setInputFiles('public/assets/mascots/welcome-original.webp');
 await expect(page.getByRole('status')).toHaveText('Your profile photo is saved.');
 await expect(page.getByRole('img',{name:'Your profile photo',exact:true})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'Hello, Parent Ana!'})).toBeVisible();
 await expect(page.getByRole('img',{name:'Your profile photo',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Log out',exact:true}).click();
 await page.goto('/profiles');await expect(page.getByRole('button',{name:/Guest reader Grade/})).toBeVisible();
 await expect(page.getByRole('button',{name:/Luna Grade/})).toHaveCount(0);
 expect(await page.evaluate(()=>localStorage.getItem('basabuddy:v1'))).toBe(guest);
 await login(page,'PARENT@EXAMPLE.COM');await expect(page).toHaveURL(/\/profiles$/);
 await expect(page.getByRole('button',{name:/Luna Grade/})).toBeVisible();
 await page.goto('/account');await page.getByRole('button',{name:'Remove photo',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('Your profile photo was removed.');
 await page.reload();await expect(page.getByRole('img',{name:'Your profile photo',exact:true})).toHaveCount(0);
});

test('invalid credentials, duplicate email and mismatched passwords have useful errors',async({page})=>{
 await page.goto('/signup');await page.getByLabel('Your name',{exact:true}).fill('Ana');
 await page.getByLabel('Parent email',{exact:true}).fill('parent@example.com');
 await page.getByLabel('Password',{exact:true}).fill(password);
 await page.getByLabel('Confirm password',{exact:true}).fill('DifferentPassword');
 await page.getByRole('button',{name:'Create account',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('passwords do not match');
 await signup(page);await logout(page);
 await login(page,'parent@example.com','IncorrectPassword');await expect(page.getByRole('alert')).toContainText('Email or password is incorrect');
 await page.goto('/signup');await page.getByLabel('Your name',{exact:true}).fill('Other name');await page.getByLabel('Parent email',{exact:true}).fill('PARENT@example.com');
 await page.getByLabel('Password',{exact:true}).fill(password);await page.getByLabel('Confirm password',{exact:true}).fill(password);await page.getByRole('button',{name:'Create account',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('already exists on this device');
});

test('deletion requires the password and explicit confirmation, and preserves other accounts and guest data',async({page})=>{
 await page.goto('/profiles');await addReader(page,'Guest');const guest=await page.evaluate(()=>localStorage.getItem('basabuddy:v1'));
 await signup(page,'first@example.com','First parent');await addReader(page,'First reader');
 await logout(page);await signup(page,'second@example.com','Second parent');await addReader(page,'Second reader');await logout(page);
 await login(page,'first@example.com');await expect(page).toHaveURL(/\/profiles$/);await page.goto('/account');
 await page.getByRole('button',{name:'Delete my account',exact:true}).click();
 await expect(page.getByRole('button',{name:'Permanently delete account'})).toBeDisabled();
 await page.getByRole('button',{name:'Keep my account'}).click();await expect(page.getByRole('heading',{name:'Hello, First parent!'})).toBeVisible();
 await page.getByRole('button',{name:'Delete my account',exact:true}).click();
 await page.getByLabel('Password',{exact:true}).fill('IncorrectPassword');await page.getByLabel('Type DELETE to confirm').fill('DELETE');
 await page.getByRole('button',{name:'Permanently delete account'}).click();await expect(page.getByRole('alert')).toContainText('password is incorrect');
 await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Permanently delete account'}).click();
 await expect(page.getByRole('heading',{name:'Your account has been deleted.'})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('basabuddy:v1'))).toBe(guest);
 const scoped=await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('basabuddy:v1:account:')));expect(scoped).toHaveLength(1);
 await login(page,'first@example.com');await expect(page.getByRole('alert')).toContainText('Email or password is incorrect');
 await login(page,'second@example.com');await expect(page).toHaveURL(/\/profiles$/);await expect(page.getByRole('button',{name:/Second reader Grade/})).toBeVisible();
});

test('passwords are salted and hashed, and never written to Web Storage',async({page})=>{
 await signup(page);await logout(page);await signup(page,'second@example.com');
 const data=await page.evaluate(async()=>{
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('basabuddy-accounts',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const accounts=await new Promise<any[]>((resolve,reject)=>{const r=db.transaction('accounts','readonly').objectStore('accounts').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();
  return {accounts,local:{...localStorage},session:{...sessionStorage}};
 });
 expect(JSON.stringify(data)).not.toContain(password);
 expect(data.accounts).toHaveLength(2);expect(data.accounts[0].salt).toHaveLength(16);expect(data.accounts[0].verifier).toHaveLength(32);
 expect(data.accounts[0].salt).not.toEqual(data.accounts[1].salt);expect(data.accounts[0].verifier).not.toEqual(data.accounts[1].verifier);
});

test('photo validation rejects unsafe and oversized files and signup photo persists',async({page})=>{
 await page.goto('/signup');
 await page.getByLabel('Choose profile photo').setInputFiles({name:'photo.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});
 await expect(page.getByRole('alert')).toContainText('Choose a JPG, PNG, or WebP');
 await page.getByLabel('Choose profile photo').setInputFiles({name:'huge.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(5*1024*1024+1)});
 await expect(page.getByRole('alert')).toContainText('smaller than 5 MB');
 const bytes=await readFile('public/assets/mascots/welcome-original.webp');
 await page.getByLabel('Choose profile photo').setInputFiles({name:'photo.webp',mimeType:'image/webp',buffer:bytes});
 await expect(page.getByRole('img',{name:'Your profile photo',exact:true})).toBeVisible();
 await page.getByLabel('Your name',{exact:true}).fill('Photo parent');await page.getByLabel('Parent email',{exact:true}).fill('photo@example.com');
 await page.getByLabel('Password',{exact:true}).fill(password);await page.getByLabel('Confirm password',{exact:true}).fill(password);await page.getByRole('button',{name:'Create account',exact:true}).click();
 await expect(page).toHaveURL(/\/profiles$/);await page.goto('/account');await expect(page.getByRole('img',{name:'Your profile photo',exact:true})).toBeVisible();
});

test('account forms fit mobile and desktop and password visibility is accessible',async({page})=>{
 for(const width of [320,393,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/login');
  await expect(page.getByRole('heading',{name:'Log in to your parent account'})).toBeVisible();
  await page.getByRole('button',{name:'Show password',exact:true}).click();await expect(page.getByLabel('Password',{exact:true})).toHaveAttribute('type','text');
  await page.getByRole('button',{name:'Hide password',exact:true}).click();await expect(page.getByLabel('Password',{exact:true})).toHaveAttribute('type','password');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/account-login-${width}.png`,fullPage:true});
  await page.goto('/signup');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
