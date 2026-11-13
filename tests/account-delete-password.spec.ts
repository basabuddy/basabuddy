import {test,expect} from '@playwright/test';

test('account deletion rejects different passwords without changing account or reader data',async({page})=>{
 const password='ReadingStars123!';
 await page.goto('/signup');
 await page.getByLabel('Iyong pangalan',{exact:true}).fill('Deletion test reader');
 await page.getByLabel('Email ng account',{exact:true}).fill('delete-password@example.com');
 await page.getByLabel('Password',{exact:true}).fill(password);
 await page.getByLabel('Ulitin ang password',{exact:true}).fill(password);
 await page.getByRole('button',{name:'Gumawa ng account',exact:true}).click();
 await expect(page).toHaveURL(/\/language$/);
 await page.goto('/account');
 const before=await page.evaluate(()=>{
  const id=sessionStorage.getItem('basabuddy:account-session');
  return {id,readers:localStorage.getItem(`basabuddy:v1:account:${id}`)};
 });
 await page.getByRole('button',{name:'Burahin ang aking account',exact:true}).click();
 await page.getByLabel('I-type ang DELETE upang kumpirmahin').fill('DELETE');
 const submit=page.getByRole('button',{name:'Tuluyang burahin ang account',exact:true});
 await expect(submit).toBeDisabled();
 for(const wrong of ['IncorrectPassword','readingstars123!','ReadingStars123! ']){
  await page.getByLabel('Password',{exact:true}).fill(wrong);
  await submit.click();
  await expect(page.getByRole('alert')).toHaveText('Hindi tama ang password. Hindi nabura ang iyong account.');
  await expect(page).toHaveURL(/\/account$/);
  expect(await page.evaluate(()=>{
   const id=sessionStorage.getItem('basabuddy:account-session');
   return {id,readers:localStorage.getItem(`basabuddy:v1:account:${id}`)};
  })).toEqual(before);
 }
 await page.reload();
 await expect(page.getByRole('heading',{name:'Magandang araw, Deletion test reader!'})).toBeVisible();
 await page.getByRole('button',{name:'Burahin ang aking account',exact:true}).click();
 await page.getByLabel('I-type ang DELETE upang kumpirmahin').fill('DELETE');
 await page.getByLabel('Password',{exact:true}).fill(password);
 await submit.click();
 await expect(page).toHaveURL(/\/account-deleted$/);
 expect(await page.evaluate(()=>sessionStorage.getItem('basabuddy:account-session'))).toBeNull();
});
