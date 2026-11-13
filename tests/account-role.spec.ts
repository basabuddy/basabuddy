import {test,expect} from '@playwright/test';

test('account settings show Student and Teacher choices and persist saved changes',async({page})=>{
 await page.goto('/signup');
 await page.getByRole('group',{name:'Wika ng interface'}).getByRole('button',{name:'Ingles',exact:true}).click();
 await page.getByLabel('Your name',{exact:true}).fill('Role test');
 await page.getByLabel('Account email',{exact:true}).fill('role-settings@example.com');
 await page.getByLabel('Password',{exact:true}).fill('ReadingStars123!');
 await page.getByLabel('Confirm password',{exact:true}).fill('ReadingStars123!');
 await page.getByRole('button',{name:'Create account',exact:true}).click();
 await expect(page).toHaveURL(/\/language$/);
 await page.goto('/account');
 const details=page.locator('.account-details');
 await expect(details.getByRole('radio',{name:'Student',exact:true})).toBeChecked();
 await details.getByRole('radio',{name:'Teacher',exact:true}).check();
 await details.getByRole('button',{name:'Save account details',exact:true}).click();
 await expect(details.getByRole('status')).toHaveText('Your account details are saved.');
 await expect(page.getByRole('link',{name:'Open teacher area',exact:true})).toBeVisible();
 await page.reload();
 await expect(details.getByRole('radio',{name:'Teacher',exact:true})).toBeChecked();
 await details.getByRole('radio',{name:'Student',exact:true}).check();
 await details.getByRole('button',{name:'Save account details',exact:true}).click();
 await expect(details.getByRole('status')).toHaveText('Your account details are saved.');
 await page.reload();
 await expect(details.getByRole('radio',{name:'Student',exact:true})).toBeChecked();
 await expect(details.getByLabel('Your name',{exact:true})).toHaveValue('Role test');
});
