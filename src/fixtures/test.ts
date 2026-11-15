import { test as base, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { ShopApi, type CartItem } from '../api/ShopApi';

type Fixtures = {
  loginPage: LoginPage;
  catalog: CatalogPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkout: CheckoutPage;
  confirmation: ConfirmationPage;
  shopApi: ShopApi;
  /** Seeds the browser cart directly through localStorage - faster than clicking through the catalog. */
  seedCart: (items: CartItem[]) => Promise<void>;
};

export const STORAGE_STATE = '.auth/standard-user.json';

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  catalog: async ({ page }, use) => use(new CatalogPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkout: async ({ page }, use) => use(new CheckoutPage(page)),
  confirmation: async ({ page }, use) => use(new ConfirmationPage(page)),
  shopApi: async ({ request }, use) => use(new ShopApi(request)),
  seedCart: async ({ page }, use) => {
    await use(async (items) => {
      await page.goto('/shop/index.html');
      await page.evaluate((cart) => localStorage.setItem('summit.cart', JSON.stringify(cart)), items.map((i) => ({ size: 'One size', ...i })));
    });
  },
});

export { expect };

export async function expectNoConsoleErrors(page: Page, action: () => Promise<void>) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await action();
  expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
}
