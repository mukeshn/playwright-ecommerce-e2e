import { test, expect } from '../../src/fixtures/test';

test.describe('Mobile navigation', { tag: '@mobile' }, () => {
  test.skip(({ isMobile }) => !isMobile, 'runs in the mobile-chrome project only');

  test('category links live behind the menu toggle on small screens', async ({ page }) => {
    await page.goto('/shop/index.html');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav).toBeHidden();
    await page.getByTestId('menu-toggle').click();
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: 'Footwear' }).click();
    await expect(page.getByTestId('page-title')).toHaveText('Footwear');
  });

  test('add to cart works with tap', async ({ page }) => {
    await page.goto('/shop/index.html');
    const card = page.getByTestId('product-card').filter({ hasText: 'Wool Hiking Socks' });
    await card.getByRole('button', { name: 'Add to cart' }).tap();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });
});
