import { test, expect, STORAGE_STATE, expectNoConsoleErrors } from '../../src/fixtures/test';
import { buildCustomer } from '../../src/data/customers';

test.describe('Checkout - guest', () => {
  test('guest places an order end-to-end from the catalog', { tag: ['@smoke', '@e2e'] }, async ({ page, catalog, cartPage, checkout, confirmation }) => {
    await expectNoConsoleErrors(page, async () => {
      await catalog.goto();
      await catalog.addToCart('Insulated Bottle 750ml');
      await catalog.addToCart('Suede Care Kit');
      await catalog.cartLink.click();

      await expect(cartPage.rows).toHaveCount(2);
      await cartPage.checkout.click();

      await checkout.fillAddress(buildCustomer());
      await checkout.choosePayment('PayPal');
      await checkout.submit();

      await expect(page).toHaveURL(/confirmation\.html\?order=ORD-/);
      await expect(confirmation.title).toHaveText('Thank you for your order!');
      await expect(confirmation.status).toHaveText('CONFIRMED');
    });
    await confirmation.expectCartCount(0);
  });

  test('order total on confirmation equals checkout total', async ({ seedCart, checkout, confirmation }) => {
    await seedCart([{ productId: 4, quantity: 3 }]);
    await checkout.goto();
    await checkout.fillAddress(buildCustomer({ country: 'AT', postcode: '6020', city: 'Innsbruck' }));
    const total = await checkout.total.innerText();
    await checkout.submit();
    await expect(confirmation.total).toHaveText(total);
  });

  test('invoice payment is blocked for guests', async ({ seedCart, checkout }) => {
    await seedCart([{ productId: 4, quantity: 1 }]);
    await checkout.goto();
    await checkout.fillAddress(buildCustomer());
    await checkout.choosePayment('Invoice (registered customers only)');
    await checkout.submit();
    await expect(checkout.fieldError('payment')).toHaveText('Invoice is only available for registered customers.');
  });

  test('empty cart redirects back to the cart page', async ({ page, checkout }) => {
    await checkout.goto();
    await expect(page).toHaveURL(/cart\.html/);
  });
});

test.describe('Checkout - registered customer', () => {
  test.use({ storageState: STORAGE_STATE });

  test('email is pre-filled and invoice is allowed', { tag: '@regression' }, async ({ page, seedCart, checkout, confirmation }) => {
    await seedCart([{ productId: 8, quantity: 2 }]);
    await checkout.goto();
    await expect(page.getByLabel('Email')).toHaveValue('standard@shop.test');
    const c = buildCustomer({ email: 'standard@shop.test' });
    await checkout.fillAddress(c);
    await checkout.choosePayment('Invoice (registered customers only)');
    await checkout.submit();
    await expect(confirmation.orderId).toHaveText(/^ORD-/);
  });
});

test.describe('Checkout - resilience', () => {
  test('shows a friendly message when stock ran out meanwhile', async ({ page, seedCart, checkout }) => {
    await page.route('**/api/shop/orders', (route) => route.fulfill({ status: 409, json: { error: 'INSUFFICIENT_STOCK', sku: 'SKU-1004', available: 0 } }));
    await seedCart([{ productId: 4, quantity: 1 }]);
    await checkout.goto();
    await checkout.fillAddress(buildCustomer());
    await checkout.submit();
    await expect(checkout.error).toHaveText('Sorry, one of the items is no longer available in that quantity.');
    await expect(checkout.placeOrder).toBeEnabled();
  });

  test('place order button is disabled while the request is in flight', async ({ page, seedCart, checkout }) => {
    await page.route('**/api/shop/orders', async (route) => { await new Promise((r) => setTimeout(r, 800)); await route.continue(); });
    await seedCart([{ productId: 4, quantity: 1 }]);
    await checkout.goto();
    await checkout.fillAddress(buildCustomer());
    await checkout.submit();
    await expect(page.getByRole('button', { name: 'Placing order…' })).toBeDisabled();
    await expect(page).toHaveURL(/confirmation/);
  });
});
