import { test, expect } from '../../src/fixtures/test';
import markets from '../../src/data/markets.json' with { type: 'json' };

// One basket, ten markets: the storefront ships to many EU countries,
// so VAT and totals are checked for every market we sell in.
const BASKET = [{ productId: 1, quantity: 1 }]; // Trail Runner GTX - 139.00, free shipping

test.describe('VAT per shipping country', () => {
  for (const m of markets) {
    test(`${m.name} (${m.country}) applies ${m.vat}% VAT`, { tag: '@regression' }, async ({ seedCart, cartPage }) => {
      await seedCart(BASKET);
      await cartPage.goto();
      await cartPage.shipTo(m.country);
      await expect(cartPage.vatRate).toHaveText(String(m.vat));
      const expected = Math.round(139 * (1 + m.vat / 100) * 100) / 100;
      expect(await cartPage.totalValue()).toBeCloseTo(expected, 2);
    });
  }
});
