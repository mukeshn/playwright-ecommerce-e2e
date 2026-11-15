import { type Locator, type Page, expect } from '@playwright/test';

export abstract class BasePage {
  protected abstract readonly path: string;
  readonly cartCount: Locator;
  readonly cartLink: Locator;

  constructor(protected readonly page: Page) {
    this.cartCount = page.getByTestId('cart-count');
    this.cartLink = page.getByTestId('cart-link');
  }

  async goto(query = ''): Promise<this> {
    await this.page.goto(this.path + query);
    return this;
  }

  async expectCartCount(n: number) {
    if (n === 0) await expect(this.cartCount).toBeHidden();
    else await expect(this.cartCount).toHaveText(String(n));
  }
}
