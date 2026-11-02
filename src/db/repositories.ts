import { db, type Customer, type Order, type Product, type Settings } from './schema';
import { BACKUP_SCHEMA_VERSION } from '../lib/backup';

// Screens read and write through these, never through db.<table> directly, so a later
// schema version changes one file. Screens that need to re-render use useLiveQuery
// around these reads.

const defaultSettings: Settings = {
  id: 'me',
  businessName: '',
  templates: {},
  schemaVersion: BACKUP_SCHEMA_VERSION,
};

export const settingsRepo = {
  async get(): Promise<Settings> {
    return (await db.settings.get('me')) ?? defaultSettings;
  },
  // Read-modify-write inside a transaction: the name is saved on every keystroke, and
  // two overlapping writes must not let an older copy of the row win.
  update(changes: Partial<Omit<Settings, 'id'>>): Promise<void> {
    return db.transaction('rw', db.settings, async () => {
      const current = await settingsRepo.get();
      await db.settings.put({ ...current, ...changes });
    });
  },
  removeLogo(): Promise<void> {
    return db.transaction('rw', db.settings, async () => {
      const { logo: _dropped, ...rest } = await settingsRepo.get();
      await db.settings.put(rest);
    });
  },
};

export const productsRepo = {
  all: (): Promise<Product[]> => db.products.orderBy('name').toArray(),
  get: (id: string) => db.products.get(id),
  put: (product: Product) => db.products.put(product),
};

export const customersRepo = {
  all: (): Promise<Customer[]> => db.customers.orderBy('name').toArray(),
  get: (id: string) => db.customers.get(id),
  put: (customer: Customer) => db.customers.put(customer),
  delete: (id: string) => db.customers.delete(id),
};

export const ordersRepo = {
  all: (): Promise<Order[]> => db.orders.orderBy('deliveryDate').toArray(),
  get: (id: string) => db.orders.get(id),
  byCustomer: (customerId: string): Promise<Order[]> =>
    db.orders.where('customerId').equals(customerId).sortBy('deliveryDate'),
  put: (order: Order) => db.orders.put(order),
};
