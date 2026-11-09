import { db, type Customer, type Ingredient, type Order, type Product, type Settings, type TemplateKey } from './schema';
import { BACKUP_SCHEMA_VERSION } from '../lib/backup';
import { usedIngredientIds } from '../lib/costing';

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
  /** `undefined` removes her version, so the default text applies again. */
  setTemplate(key: TemplateKey, text: string | undefined): Promise<void> {
    return db.transaction('rw', db.settings, async () => {
      const current = await settingsRepo.get();
      const { [key]: _old, ...others } = current.templates;
      await db.settings.put({ ...current, templates: text === undefined ? others : { ...others, [key]: text } });
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
// No delete for products: an order line may point at one (productId), and a retired
// product keeps its name and price for that history (step 06).

export const customersRepo = {
  all: (): Promise<Customer[]> => db.customers.orderBy('name').toArray(),
  get: (id: string) => db.customers.get(id),
  put: (customer: Customer) => db.customers.put(customer),
  /**
   * Saves an edit. An order's title is the customer's name at save (D28), so a rename is
   * carried to her orders in the same transaction; otherwise the list keeps the old name.
   */
  save: (customer: Customer): Promise<void> =>
    db.transaction('rw', db.customers, db.orders, async () => {
      await db.customers.put(customer);
      await db.orders.where('customerId').equals(customer.id).modify((order) => {
        order.title = customer.name;
      });
    }),
  /** A partial update, so notes saved as she types never overwrite an edit to the name. */
  updateNotes: (id: string, notes: string) => db.customers.update(id, { notes }),
  /** Refused (false) while she has orders: an order must always have its customer. */
  deleteIfNoOrders: (id: string): Promise<boolean> =>
    db.transaction('rw', db.customers, db.orders, async () => {
      if ((await db.orders.where('customerId').equals(id).count()) > 0) return false;
      await db.customers.delete(id);
      return true;
    }),
};

export const ordersRepo = {
  all: (): Promise<Order[]> => db.orders.orderBy('deliveryDate').toArray(),
  get: (id: string) => db.orders.get(id),
  byCustomer: (customerId: string): Promise<Order[]> =>
    db.orders.where('customerId').equals(customerId).sortBy('deliveryDate'),
  put: (order: Order) => db.orders.put(order),
  /** A new customer and the order are written together or not at all. */
  saveWithCustomer: (order: Order, newCustomer?: Customer): Promise<void> =>
    db.transaction('rw', db.customers, db.orders, async () => {
      if (newCustomer) await db.customers.put(newCustomer);
      await db.orders.put(order);
    }),
};

export const ingredientsRepo = {
  all: (): Promise<Ingredient[]> => db.ingredients.orderBy('name').toArray(),
  get: (id: string) => db.ingredients.get(id),
  put: (ingredient: Ingredient) => db.ingredients.put(ingredient),
  /**
   * Refused (false) while a recipe uses it, as a customer with orders is refused (D35). In
   * one transaction, so a recipe saved in between cannot be left pointing at nothing.
   */
  deleteIfUnused: (id: string): Promise<boolean> =>
    db.transaction('rw', db.products, db.ingredients, async () => {
      if (usedIngredientIds(await db.products.toArray()).has(id)) return false;
      await db.ingredients.delete(id);
      return true;
    }),
};
