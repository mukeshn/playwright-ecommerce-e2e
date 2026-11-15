import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  protected readonly path = '/shop/product.html';
  readonly name: Locator;
  readonly price: Locator;
  readonly size: Locator;
  readonly quantity: Locator;
  readonly addButton: Locator;
  readonly error: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('pdp-name');
    this.price = page.getByTestId('pdp-price');
    this.size = page.getByLabel('Size');
    this.quantity = page.getByLabel('Quantity');
    this.addButton = page.getByTestId('pdp-add');
    this.error = page.getByTestId('pdp-error');
    this.breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  }

  async open(productId: number) {
    return this.goto(`?id=${productId}`);
  }

  async add({ size, quantity = 1 }: { size?: string; quantity?: number } = {}) {
    if (size) await this.size.selectOption(size);
    await this.quantity.fill(String(quantity));
    await this.addButton.click();
  }
}
