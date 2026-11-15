export interface Customer {
  email: string;
  firstName: string;
  lastName: string;
  street: string;
  postcode: string;
  city: string;
  country: string;
}

const FIRST = ['Anna', 'Lukas', 'Mia', 'Felix', 'Lea', 'Jonas', 'Emma', 'Paul'];
const LAST = ['Müller', 'Schmidt', 'Fischer', 'Weber', 'Wagner', 'Becker', 'Hoffmann', 'Koch'];
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Builds a unique, valid customer. Override any field to create negative cases. */
export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  const firstName = pick(FIRST);
  const lastName = pick(LAST);
  const unique = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
  return {
    email: `${firstName}.${unique}@example.com`.toLowerCase(),
    firstName,
    lastName,
    street: `Maximilianstraße ${Math.floor(Math.random() * 90) + 1}`,
    postcode: '86150',
    city: 'Augsburg',
    country: 'DE',
    ...overrides,
  };
}

export const USERS = {
  standard: { email: 'standard@shop.test', password: 'Passw0rd!' },
  locked: { email: 'locked@shop.test', password: 'Passw0rd!' },
  admin: { email: 'admin@shop.test', password: 'Adm1n!2026' },
} as const;
