import { test, expect } from '../../src/fixtures/test';
import { USERS } from '../../src/data/customers';

test.describe('Customer login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('registered customer can sign in and sign out', { tag: ['@smoke', '@auth'] }, async ({ page, loginPage }) => {
    await loginPage.login(USERS.standard.email, USERS.standard.password);
    await expect(page).toHaveURL(/\/shop\/index\.html/);
    await expect(page.getByTestId('user-name')).toHaveText('Hi, Alex Becker');

    await page.getByTestId('logout').click();
    await expect(page).toHaveURL(/login\.html/);
    await expect(page.getByTestId('login-link')).toBeVisible();
  });

  test('locked account sees a dedicated message', { tag: '@auth' }, async ({ loginPage }) => {
    await loginPage.login(USERS.locked.email, USERS.locked.password);
    await expect(loginPage.error).toHaveText('Your account is locked. Please contact customer service.');
  });

  const invalid = [
    { name: 'wrong password', email: USERS.standard.email, password: 'nope', message: 'Email or password is incorrect.' },
    { name: 'unknown email', email: 'ghost@shop.test', password: 'Passw0rd!', message: 'Email or password is incorrect.' },
    { name: 'empty form', email: '', password: '', message: 'Email and password are required.' },
  ];
  for (const c of invalid) {
    test(`rejects ${c.name}`, { tag: '@auth' }, async ({ loginPage }) => {
      await loginPage.login(c.email, c.password);
      await expect(loginPage.error).toHaveText(c.message);
      await expect(loginPage.email).toHaveValue(c.email);
    });
  }

  test('password is never sent in the URL', { tag: '@security' }, async ({ page, loginPage }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await loginPage.login(USERS.standard.email, USERS.standard.password);
    await expect(page.getByTestId('user-name')).toBeVisible();
    expect(requests.filter((u) => u.includes('Passw0rd'))).toHaveLength(0);
  });
});
