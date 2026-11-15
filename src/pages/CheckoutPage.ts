import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Customer } from '../data/customers';

export type PaymentMethod = 'Credit card' | 'PayPal' | 'Invoice (registered customers only)';

export class CheckoutPage extends BasePage {
  protected readonly path = '/shop/checkout.html';
  readonly placeOrder: Locator;
  readonly terms: Locator;
  readonly error: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    super(page);
    this.placeOrder = page.getByRole('button', { name: 'Place order' });
    this.terms = page.getByLabel('I accept the terms and conditions');
    this.error = page.getByTestId('checkout-error');
    this.total = page.getByTestId('checkout-total');
  }

  fieldError(field: 'email' | 'firstName' | 'lastName' | 'street' | 'postcode' | 'payment' | 'terms') {
    return this.page.locator(`[data-error-for="${field}"]`);
  }

  async fillAddress(c: Customer) {
    await this.page.getByLabel('Email').fill(c.email);
    await this.page.getByLabel('First name').fill(c.firstName);
    await this.page.getByLabel('Last name').fill(c.lastName);
    await this.page.getByLabel('Street and number').fill(c.street);
    await this.page.getByLabel('Postcode').fill(c.postcode);
    await this.page.getByLabel('City').fill(c.city);
    await this.page.getByLabel('Country').selectOption(c.country);
  }

  async choosePayment(method: PaymentMethod) {
    await this.page.getByLabel(method).check();
  }

  async submit({ acceptTerms = true } = {}) {
    if (acceptTerms) await this.terms.check();
    await this.placeOrder.click();
  }
}
