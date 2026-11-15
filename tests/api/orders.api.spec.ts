import { test, expect } from '../../src/fixtures/test';
import { buildCustomer, USERS } from '../../src/data/customers';

test.describe('Orders API', { tag: '@api' }, () => {
  test('creates an order and reduces stock', async ({ request, shopApi }) => {
    const before = await shopApi.productByName('Wool Hiking Socks');
    const res = await shopApi.placeOrder(buildCustomer(), [{ productId: before.id, quantity: 2 }], 'card');
    expect(res.status()).toBe(201);
    const order = await res.json();
    expect(order).toMatchObject({ status: 'CONFIRMED', currency: 'EUR', vatRate: 19 });
    expect(res.headers()['location']).toBe(`/api/shop/orders/${order.id}`);

    const after = await shopApi.productByName('Wool Hiking Socks');
    expect(after.stock).toBe(before.stock - 2);

    const fetched = await request.get(`/api/shop/orders/${order.id}`);
    expect(await fetched.json()).toEqual(order);
  });

  test('returns all validation errors at once', async ({ shopApi }) => {
    const res = await shopApi.placeOrder(buildCustomer({ email: 'x', postcode: 'abc', country: 'US' }), [], 'cash');
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.details).toEqual(expect.arrayContaining([
      'customer.email is invalid',
      'customer.postcode must be 4-5 digits',
      'customer.country is not supported',
      'items must not be empty',
      'paymentMethod must be card, paypal or invoice',
    ]));
  });

  test('rejects quantities above available stock with 409', async ({ shopApi }) => {
    const jacket = await shopApi.productByName('Rain Shell Jacket');
    const res = await shopApi.placeOrder(buildCustomer(), [{ productId: jacket.id, quantity: 1 }]);
    expect(res.status()).toBe(409);
    expect(await res.json()).toMatchObject({ error: 'INSUFFICIENT_STOCK', available: 0 });
  });

  test('order can be cancelled exactly once', async ({ request, shopApi }) => {
    const order = await (await shopApi.placeOrder(buildCustomer(), [{ productId: 11, quantity: 1 }])).json();
    const first = await request.post(`/api/shop/orders/${order.id}/cancel`);
    expect(first.status()).toBe(200);
    expect((await first.json()).status).toBe('CANCELLED');
    const second = await request.post(`/api/shop/orders/${order.id}/cancel`);
    expect(second.status()).toBe(409);
  });

  test('catalog admin endpoints require the admin role', async ({ request, shopApi }) => {
    const customerToken = await shopApi.login(USERS.standard.email, USERS.standard.password);
    const forbidden = await request.post('/api/shop/products', { headers: { authorization: `Bearer ${customerToken}` }, data: { name: 'Hack', category: 'Apparel', price: 1 } });
    expect(forbidden.status()).toBe(403);

    const adminToken = await shopApi.login(USERS.admin.email, USERS.admin.password);
    const created = await request.post('/api/shop/products', { headers: { authorization: `Bearer ${adminToken}` }, data: { name: `Gift Card ${Date.now()}`, category: 'Accessories', price: 25 } });
    expect(created.status()).toBe(201);
    const product = await created.json();
    const del = await request.delete(`/api/shop/products/${product.id}`, { headers: { authorization: `Bearer ${adminToken}` } });
    expect(del.status()).toBe(204);
  });
});
