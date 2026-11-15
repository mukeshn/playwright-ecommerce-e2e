import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating';

export class CatalogPage extends BasePage {
  protected readonly path = '/shop/index.html';
  readonly search: Locator;
  readonly category: Locator;
  readonly sort: Locator;
  readonly inStockOnly: Locator;
  readonly cards: Locator;
  readonly resultCount: Locator;
  readonly emptyState: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    this.search = page.getByRole('searchbox', { name: 'Search' });
    this.category = page.getByLabel('Category');
    this.sort = page.getByLabel('Sort by');
    this.inStockOnly = page.getByLabel('In stock only');
    this.cards = page.getByTestId('product-card');
    this.resultCount = page.getByTestId('result-count');
    this.emptyState = page.getByTestId('empty-state');
    this.toast = page.getByTestId('toast');
  }

  card(name: string) {
    return this.cards.filter({ has: this.page.getByRole('heading', { name, exact: true }) });
  }

  async searchFor(term: string) {
    const response = this.page.waitForResponse((r) => r.url().includes('/api/shop/products') && r.url().includes(`q=${encodeURIComponent(term)}`));
    await this.search.fill(term);
    await response;
  }

  async filterByCategory(category: string) {
    await this.category.selectOption(category);
    await expect(this.page.getByTestId('page-title')).toHaveText(category || 'All products');
  }

  async sortBy(option: SortOption) {
    const response = this.page.waitForResponse((r) => r.url().includes(`sort=${option}`));
    await this.sort.selectOption(option);
    await response;
  }

  async prices(): Promise<number[]> {
    const values = await this.page.getByTestId('product-price').evaluateAll((els) => els.map((e) => Number((e as HTMLElement).dataset.value)));
    return values;
  }

  async names(): Promise<string[]> {
    return this.page.getByTestId('product-name').allInnerTexts();
  }

  async addToCart(name: string) {
    await this.card(name).getByRole('button', { name: 'Add to cart' }).click();
    await expect(this.toast).toHaveText('Added to cart');
  }
}
