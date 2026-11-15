import { type APIRequestContext, expect } from '@playwright/test';
import type { Customer } from '../data/customers';

export interface CartItem { productId: number; size?: string; quantity: number }
export interface Product { id: number; sku: string; name: string; category: string; price: number; stock: number }

/** Thin typed client used for test data setup and API-level assertions. */
export class ShopApi {
  constructor(private readonly request: APIRequestContext) {}

  async login(email: string, password: string): Promise<string> {
    const res = await this.request.post('/api/shop/auth/login', { data: { email, password } });
    expect(res, await res.text()).toBeOK();
    return (await res.json()).token;
  }

  async products(params: Record<string, string> = {}): Promise<Product[]> {
    const res = await this.request.get('/api/shop/products', { params });
    expect(res).toBeOK();
    return (await res.json()).items;
  }

  async productByName(name: string): Promise<Product> {
    const match = (await this.products({ q: name })).find((p) => p.name === name);
    if (!match) throw new Error(`Product "${name}" not found`);
    return match;
  }

  async pricing(items: CartItem[], country = 'DE', promo?: string) {
    const res = await this.request.post('/api/shop/pricing', { data: { items, country, promo } });
    expect(res).toBeOK();
    return res.json() as Promise<{ subtotal: number; discount: number; shipping: number; vat: number; vatRate: number; total: number }>;
  }

  async placeOrder(customer: Customer, items: CartItem[], paymentMethod = 'card', promo?: string) {
    return this.request.post('/api/shop/orders', { data: { customer, items, paymentMethod, promo } });
  }
}
