import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/test';

const pages = [
  { name: 'catalog', path: '/shop/index.html', ready: 'product-card' },
  { name: 'product detail', path: '/shop/product.html?id=1', ready: 'pdp-name' },
  { name: 'login', path: '/shop/login.html', ready: 'login-submit' },
];

test.describe('Accessibility (WCAG 2.1 AA)', { tag: '@a11y' }, () => {
  for (const p of pages) {
    test(`${p.name} has no serious or critical violations`, async ({ page }, testInfo) => {
      await page.goto(p.path);
      await expect(page.getByTestId(p.ready).first()).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      await testInfo.attach('axe-results', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      const blocking = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
      expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });
  }

  test('checkout form can be completed with the keyboard only', async ({ page, seedCart }) => {
    await seedCart([{ productId: 4, quantity: 1 }]);
    await page.goto('/shop/checkout.html');
    await page.getByLabel('Email').focus();
    for (const value of ['kb@example.com', 'Kim', 'Berg', 'Hauptstraße 5', '80331', 'München']) {
      await page.keyboard.type(value);
      await page.keyboard.press('Tab');
    }
    await expect(page.getByLabel('City')).toHaveValue('München');
  });
});
