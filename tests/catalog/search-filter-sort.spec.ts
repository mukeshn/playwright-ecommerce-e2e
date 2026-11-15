import { test, expect } from '../../src/fixtures/test';

test.describe('Catalog: search, filter and sort', () => {
  test.beforeEach(async ({ catalog }) => {
    await catalog.goto();
    await expect(catalog.cards.first()).toBeVisible();
  });

  test('shows the full assortment by default', { tag: '@smoke' }, async ({ catalog }) => {
    await expect(catalog.cards).toHaveCount(12);
    await expect(catalog.resultCount).toHaveText('12 products');
  });

  test('search matches product name and SKU', async ({ catalog }) => {
    await catalog.searchFor('clog');
    await expect(catalog.cards).toHaveCount(1);
    await expect(catalog.card('Leather Clog Classic')).toBeVisible();

    await catalog.searchFor('SKU-1011');
    await expect(catalog.cards).toHaveCount(1);
    await expect(catalog.resultCount).toHaveText('1 product');
  });

  test('search without results shows an empty state', async ({ catalog }) => {
    await catalog.searchFor('snowboard');
    await expect(catalog.cards).toHaveCount(0);
    await expect(catalog.emptyState).toBeVisible();
  });

  for (const category of ['Footwear', 'Apparel', 'Accessories']) {
    test(`category filter: ${category}`, async ({ page, catalog }) => {
      await catalog.filterByCategory(category);
      const categories = await page.locator('[data-testid="product-card"] .muted:first-of-type').allInnerTexts();
      expect(categories.length).toBeGreaterThan(0);
      for (const c of categories) expect(c).toContain(category);
    });
  }

  test('sort by price ascending and descending', { tag: '@regression' }, async ({ catalog }) => {
    await catalog.sortBy('price-asc');
    const asc = await catalog.prices();
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    await catalog.sortBy('price-desc');
    const desc = await catalog.prices();
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  test('sort by name A-Z uses locale-aware ordering', async ({ catalog }) => {
    await catalog.sortBy('name-asc');
    const names = await catalog.names();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('out-of-stock products cannot be added and can be hidden', async ({ catalog }) => {
    const jacket = catalog.card('Rain Shell Jacket');
    await expect(jacket.getByTestId('stock')).toHaveText('Out of stock');
    await expect(jacket.getByRole('button', { name: 'Add to cart' })).toBeDisabled();

    await catalog.inStockOnly.check();
    await expect(jacket).toHaveCount(0);
    await expect(catalog.cards).toHaveCount(11);
  });

  test('low stock badge is shown when fewer than 5 items remain', async ({ catalog }) => {
    await expect(catalog.card('Cork Sandal Two-Strap').getByTestId('stock')).toHaveText(/Only \d left/);
  });

  test('category deep link pre-selects the filter', async ({ page, catalog }) => {
    await catalog.goto('?category=Apparel');
    await expect(catalog.category).toHaveValue('Apparel');
    await expect(page.getByTestId('page-title')).toHaveText('Apparel');
  });
});
