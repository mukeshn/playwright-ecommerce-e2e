import { test, expect } from '../../src/fixtures/test';

test.describe('Promo codes', () => {
  test.beforeEach(async ({ seedCart, cartPage }) => {
    await seedCart([{ productId: 5, quantity: 1 }]); // Merino Base Layer 79.00
    await cartPage.goto();
  });

  test('SAVE10 takes 10% off the subtotal', { tag: '@smoke' }, async ({ cartPage }) => {
    await cartPage.applyPromo('save10');
    await expect(cartPage.promoMessage).toHaveText('Promo code SAVE10 applied.');
    await expect(cartPage.discount).toHaveText('-€7.90');
  });

  test('WELCOME5 takes a fixed €5 off', async ({ cartPage }) => {
    await cartPage.applyPromo('WELCOME5');
    await expect(cartPage.discount).toHaveText('-€5.00');
  });

  test('FREESHIP removes the shipping fee below the threshold', async ({ cartPage }) => {
    await expect(cartPage.shipping).toHaveText('€4.95');
    await cartPage.applyPromo('FREESHIP');
    await expect(cartPage.shipping).toHaveText('Free');
  });

  test('unknown code is rejected and no discount applied', async ({ cartPage }) => {
    await cartPage.applyPromo('BLACKFRIDAY99');
    await expect(cartPage.promoMessage).toHaveText('Promo code "BLACKFRIDAY99" is not valid.');
    await expect(cartPage.discount).toHaveText('-€0.00');
  });

  test('UI total matches the pricing API for the same basket', { tag: '@regression' }, async ({ cartPage, shopApi }) => {
    await cartPage.applyPromo('SAVE10');
    await cartPage.shipTo('FR');
    const expected = await shopApi.pricing([{ productId: 5, quantity: 1 }], 'FR', 'SAVE10');
    expect(await cartPage.totalValue()).toBe(expected.total);
  });
});
