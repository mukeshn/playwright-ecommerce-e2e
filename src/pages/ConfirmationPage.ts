import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ConfirmationPage extends BasePage {
  protected readonly path = '/shop/confirmation.html';
  readonly title: Locator;
  readonly orderId: Locator;
  readonly status: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    this.orderId = page.getByTestId('order-id');
    this.status = page.getByTestId('order-status');
    this.total = page.getByTestId('order-total');
  }
}
