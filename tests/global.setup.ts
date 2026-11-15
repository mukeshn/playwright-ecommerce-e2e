import { test as setup, expect } from '@playwright/test';
import { USERS } from '../src/data/customers';
import { STORAGE_STATE } from '../src/fixtures/test';

setup('authenticate standard customer', async ({ page }) => {
  await page.goto('/shop/login.html');
  await page.getByLabel('Email').fill(USERS.standard.email);
  await page.getByLabel('Password').fill(USERS.standard.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByTestId('user-name')).toHaveText('Hi, Alex Becker');
  await page.context().storageState({ path: STORAGE_STATE });
});
