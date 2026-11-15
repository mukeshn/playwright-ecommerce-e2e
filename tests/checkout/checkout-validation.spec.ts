import { test, expect } from '../../src/fixtures/test';
import { buildCustomer, type Customer } from '../../src/data/customers';

type Case = { title: string; override: Partial<Customer>; field: 'email' | 'firstName' | 'lastName' | 'street' | 'postcode'; message: string };

const cases: Case[] = [
  { title: 'email without @', override: { email: 'alex.example.com' }, field: 'email', message: 'Enter a valid email address.' },
  { title: 'empty first name', override: { firstName: ' ' }, field: 'firstName', message: 'First name is required.' },
  { title: 'empty last name', override: { lastName: '' }, field: 'lastName', message: 'Last name is required.' },
  { title: 'empty street', override: { street: '' }, field: 'street', message: 'Street is required.' },
  { title: 'postcode with letters', override: { postcode: '86A50' }, field: 'postcode', message: 'Postcode must have 4 or 5 digits.' },
  { title: 'postcode too long', override: { postcode: '861500' }, field: 'postcode', message: 'Postcode must have 4 or 5 digits.' },
];

test.describe('Checkout form validation', () => {
  test.beforeEach(async ({ seedCart, checkout }) => {
    await seedCart([{ productId: 4, quantity: 1 }]);
    await checkout.goto();
  });

  for (const c of cases) {
    test(`rejects ${c.title}`, async ({ page, checkout }) => {
      await checkout.fillAddress(buildCustomer(c.override));
      await checkout.submit();
      await expect(checkout.fieldError(c.field)).toHaveText(c.message);
      await expect(page).toHaveURL(/checkout\.html/);
    });
  }

  test('terms must be accepted', async ({ checkout }) => {
    await checkout.fillAddress(buildCustomer());
    await checkout.submit({ acceptTerms: false });
    await expect(checkout.fieldError('terms')).toHaveText('Please accept the terms.');
  });

  test('invalid fields are marked aria-invalid for screen readers', { tag: '@a11y' }, async ({ page, checkout }) => {
    await checkout.submit();
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Postcode')).toHaveAttribute('aria-invalid', 'true');
  });

  test('errors clear once the field is corrected', async ({ page, checkout }) => {
    await checkout.fillAddress(buildCustomer({ email: 'bad' }));
    await checkout.submit({ acceptTerms: false });
    await expect(checkout.fieldError('email')).not.toBeEmpty();
    await page.getByLabel('Email').fill('fixed@example.com');
    await checkout.submit();
    await expect(page).toHaveURL(/confirmation/);
  });
});
