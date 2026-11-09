import Dexie, { type EntityTable } from 'dexie';
import type { Agorot } from '../lib/money';

// The five tables of docs/SPEC.md, "Data model". Dates are ISO strings, money is agorot.

export type TemplateKey = 'accepted' | 'reminder' | 'ready' | 'payment';
export type PaymentMethod = 'cash' | 'bit' | 'paybox' | 'transfer' | 'other';
export type OrderStatus = 'new' | 'confirmed' | 'delivered' | 'cancelled';

export interface Settings {
  id: 'me';
  businessName: string;
  logo?: Blob;
  // A missing template means "use the default"; the defaults arrive with step 04.
  templates: Partial<Record<TemplateKey, string>>;
  lastBackupAt?: string;
  schemaVersion: number;
}

export type IngredientUnit = 'g' | 'ml' | 'pcs';

/** Something she buys: a pack of `packQty` units for `packPrice`. The cost per unit is derived (D35). */
export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  /** In `unit`; more than 0, may have a fraction. */
  packQty: number;
  packPrice: Agorot;
  createdAt: string;
}

export interface RecipeLine {
  ingredientId: string;
  /** In the ingredient's unit, for one unit of the product; more than 0. */
  qty: number;
}

/** A named part of a recipe, in her words: "בצק", "קרם", "קישוט". */
export interface RecipePart {
  name: string;
  lines: RecipeLine[];
}

export interface Product {
  id: string;
  name: string;
  price: Agorot;
  active: boolean;
  /** The recipe for one unit. Missing or with no lines: the product has no cost (D35). */
  parts?: RecipePart[];
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export interface OrderItem {
  productId?: string;
  name: string;
  qty: number;
  unitPrice: Agorot;
  /** The product's materials cost when the line was saved, as `unitPrice` is its price (D35). */
  unitCost?: Agorot;
  details: string;
}

export interface Order {
  id: string;
  customerId: string;
  title: string;
  items: OrderItem[];
  guests?: number;
  eventDate?: string;
  deliveryDate: string;
  fulfilment: 'pickup' | 'delivery';
  address?: string;
  designNotes: string;
  status: OrderStatus;
  total: Agorot;
  paidAmount: Agorot;
  paidAt?: string;
  paidMethod?: PaymentMethod;
  deposit?: Agorot;
  depositPaidAt?: string;
  depositMethod?: PaymentMethod;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const db = new Dexie('sweetspot') as Dexie & {
  settings: EntityTable<Settings, 'id'>;
  products: EntityTable<Product, 'id'>;
  customers: EntityTable<Customer, 'id'>;
  orders: EntityTable<Order, 'id'>;
  ingredients: EntityTable<Ingredient, 'id'>;
};

// Only indexed fields are listed; Dexie stores every other field as-is.
// A new index or table means db.version(2), never an edit to version 1.
db.version(1).stores({
  settings: 'id',
  products: 'id, name',
  customers: 'id, name, phone',
  orders: 'id, customerId, deliveryDate, status',
});

// Step 09: ingredients. `parts` on a product and `unitCost` on an order line are optional
// fields that need no index, so no upgrade pass touches existing rows.
db.version(2).stores({
  ingredients: 'id, name',
});
