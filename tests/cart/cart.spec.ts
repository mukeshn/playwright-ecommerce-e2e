import { test, expect } from '../../src/fixtures/test';

test.describe('Shopping cart', () => {
  test('add from catalog updates badge and cart', { tag: '@smoke' }, async ({ catalog, cartPage }) => {
    await catalog.goto();
    await catalog.addToCart('Wool Hiking Socks');
    await catalog.addToCart('Wool Hiking Socks');
    await catalog.addToCart('Organic Cotton Tee');
    await catalog.expectCartCount(3);

    await cartPage.goto();
    await expect(cartPage.rows).toHaveCount(2);
    await expect(cartPage.row('Wool Hiking Socks').getByRole('spinbutton')).toHaveValue('2');
  });

  test('product page validates quantity against stock', async ({ productPage }) => {
    await productPage.open(3); // Cork Sandal - low stock item
    await expect(productPage.name).toHaveText('Cork Sandal Two-Strap');
    await productPage.add({ size: '40', quantity: 99 });
    await expect(productPage.error).toHaveText(/Only \d+ available\./);
    await productPage.add({ size: '40', quantity: 0 });
    await expect(productPage.error).toHaveText('Quantity must be at least 1.');
  });

  test('selected size is kept as a separate line', async ({ productPage, cartPage }) => {
    await productPage.open(2);
    await productPage.add({ size: '39' });
    await productPage.add({ size: '42' });
    await cartPage.goto();
    await expect(cartPage.rows).toHaveCount(2);
  });

  test('changing quantity recalculates line and subtotal', async ({ seedCart, cartPage }) => {
    await seedCart([{ productId: 4, quantity: 1 }]); // 14.50
    await cartPage.goto();
    await expect(cartPage.subtotal).toHaveText('€14.50');
    await cartPage.setQuantity('Wool Hiking Socks', 4);
    await expect(cartPage.row('Wool Hiking Socks').getByTestId('line-total')).toHaveText('€58.00');
    await expect(cartPage.subtotal).toHaveText('€58.00');
  });

  test('removing the last item shows the empty state', async ({ seedCart, cartPage }) => {
    await seedCart([{ productId: 9, quantity: 1 }]);
    await cartPage.goto();
    await cartPage.remove('Organic Cotton Tee');
    await expect(cartPage.empty).toBeVisible();
    await cartPage.expectCartCount(0);
  });

  test('shipping is free from €100 net order value', async ({ seedCart, cartPage }) => {
    await seedCart([{ productId: 9, quantity: 1 }]); // 29.00
    await cartPage.goto();
    await expect(cartPage.shipping).toHaveText('€4.95');
    await cartPage.setQuantity('Organic Cotton Tee', 4); // 116.00
    await expect(cartPage.shipping).toHaveText('Free');
  });

  test('cart survives a page reload', async ({ page, seedCart, cartPage }) => {
    await seedCart([{ productId: 11, quantity: 2 }]);
    await cartPage.goto();
    await page.reload();
    await expect(cartPage.row('Insulated Bottle 750ml')).toBeVisible();
    await cartPage.expectCartCount(2);
  });
});
