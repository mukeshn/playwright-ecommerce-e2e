import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/shop/cart.html';
  readonly rows: Locator;
  readonly empty: Locator;
  readonly country: Locator;
  readonly promoInput: Locator;
  readonly promoApply: Locator;
  readonly promoMessage: Locator;
  readonly subtotal: Locator;
  readonly discount: Locator;
  readonly shipping: Locator;
  readonly vatRate: Locator;
  readonly total: Locator;
  readonly checkout: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.getByTestId('cart-row');
    this.empty = page.getByTestId('cart-empty');
    this.country = page.getByLabel('Ship to');
    this.promoInput = page.getByLabel('Promo code');
    this.promoApply = page.getByRole('button', { name: 'Apply' });
    this.promoMessage = page.getByTestId('promo-message');
    this.subtotal = page.getByTestId('subtotal');
    this.discount = page.getByTestId('discount');
    this.shipping = page.getByTestId('shipping');
    this.vatRate = page.getByTestId('vat-rate');
    this.total = page.getByTestId('total');
    this.checkout = page.getByRole('link', { name: 'Proceed to checkout' });
  }

  row(name: string) {
    return this.rows.filter({ hasText: name });
  }

  async setQuantity(name: string, qty: number) {
    const pricing = this.page.waitForResponse('**/api/shop/pricing');
    await this.row(name).getByRole('spinbutton').fill(String(qty));
    await this.row(name).getByRole('spinbutton').press('Tab');
    await pricing;
  }

  async remove(name: string) {
    await this.row(name).getByRole('button', { name: 'Remove' }).click();
  }

  async applyPromo(code: string) {
    await this.promoInput.fill(code);
    const pricing = this.page.waitForResponse('**/api/shop/pricing');
    await this.promoApply.click();
    await pricing;
  }

  async shipTo(countryCode: string) {
    const pricing = this.page.waitForResponse('**/api/shop/pricing');
    await this.country.selectOption(countryCode);
    await pricing;
  }

  async totalValue(): Promise<number> {
    await expect(this.total).toHaveAttribute('data-value', /\d/);
    return Number(await this.total.getAttribute('data-value'));
  }
}
