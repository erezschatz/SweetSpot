import type { Customer, Ingredient, Order, Product, Settings } from '../db/schema';
import { localIsoDate } from './dates';

// The backup file is the only copy of her data that leaves the phone, so it is plain,
// versioned JSON that a person could read, and restore refuses anything it does not
// fully understand rather than restoring half of it.

// 2: ingredients, a product's recipe, an order line's cost (step 09). A version 1 file has
// none of them and restores as it is, with no ingredients.
export const BACKUP_SCHEMA_VERSION = 2;

/** Settings as written to the file: the logo Blob becomes base64 text. */
export type BackupSettings = Omit<Settings, 'logo'> & {
  logo?: { type: string; base64: string };
};

export interface Backup {
  app: 'sweetspot';
  schemaVersion: number;
  exportedAt: string;
  settings: BackupSettings;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  ingredients: Ingredient[];
}

export type BackupError = 'notJson' | 'notSweetSpot' | 'newerVersion' | 'damaged';

export type ParseResult = { ok: true; backup: Backup } | { ok: false; error: BackupError };

export function backupFileName(date: Date): string {
  return `sweetspot-${localIsoDate(date)}.json`;
}

export function serialiseBackup(
  data: Pick<Backup, 'settings' | 'products' | 'customers' | 'orders' | 'ingredients'>,
  exportedAt: string,
): string {
  const backup: Backup = {
    app: 'sweetspot',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt,
    ...data,
  };
  return JSON.stringify(backup, null, 1);
}

export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'notJson' };
  }
  if (!isObject(raw) || raw.app !== 'sweetspot') return { ok: false, error: 'notSweetSpot' };
  if (raw.schemaVersion === 1 && raw.ingredients === undefined) raw.ingredients = [];
  if (!Number.isInteger(raw.schemaVersion) || (raw.schemaVersion as number) < 1) {
    return { ok: false, error: 'damaged' };
  }
  if ((raw.schemaVersion as number) > BACKUP_SCHEMA_VERSION) return { ok: false, error: 'newerVersion' };

  const shapesOk =
    typeof raw.exportedAt === 'string' &&
    isSettings(raw.settings) &&
    isArrayOf(raw.products, isProduct) &&
    isArrayOf(raw.customers, isCustomer) &&
    isArrayOf(raw.orders, isOrder) &&
    isArrayOf(raw.ingredients, isIngredient);
  if (!shapesOk) return { ok: false, error: 'damaged' };

  // Checked here, not left to the database: a duplicate id or an order whose customer
  // is missing would otherwise fail halfway through the restore or orphan the order.
  const backup = raw as unknown as Backup;
  const customerIds = new Set(backup.customers.map((c) => c.id));
  const ingredientIds = new Set(backup.ingredients.map((i) => i.id));
  const consistent =
    ingredientIds.size === backup.ingredients.length &&
    backup.products.every((p) => (p.parts ?? []).every((part) => part.lines.every((l) => ingredientIds.has(l.ingredientId)))) &&
    unique(backup.products.map((p) => p.id)) &&
    customerIds.size === backup.customers.length &&
    unique(backup.orders.map((o) => o.id)) &&
    backup.orders.every((o) => customerIds.has(o.customerId));
  if (!consistent) return { ok: false, error: 'damaged' };
  return { ok: true, backup };
}

// btoa takes a "binary string"; building it in chunks keeps a large logo from
// overflowing String.fromCharCode's argument limit.
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// --- shape checks: required fields with the right types; optional ones checked when present

type Obj = Record<string, unknown>;

function isObject(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isArrayOf(v: unknown, check: (item: unknown) => boolean): boolean {
  return Array.isArray(v) && v.every(check);
}

function unique(ids: string[]): boolean {
  return new Set(ids).size === ids.length;
}

const str = (v: unknown) => typeof v === 'string';
// Money is integer agorot (D14); quantities and guests are whole and never negative.
const count = (v: unknown) => Number.isInteger(v) && (v as number) >= 0;
const optStr = (v: unknown) => v === undefined || str(v);
const optCount = (v: unknown) => v === undefined || count(v);
const base64 = (v: unknown) => str(v) && (v as string).length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(v as string);
const oneOf = (values: readonly string[]) => (v: unknown) => str(v) && values.includes(v as string);
const methods = ['cash', 'bit', 'paybox', 'transfer', 'other'] as const;
const optMethod = (v: unknown) => v === undefined || oneOf(methods)(v);

function isSettings(v: unknown): boolean {
  if (!isObject(v)) return false;
  const logoOk =
    v.logo === undefined ||
    (isObject(v.logo) && str(v.logo.type) && (v.logo.type as string).startsWith('image/') &&
      base64(v.logo.base64));
  const templatesOk =
    isObject(v.templates) && Object.values(v.templates).every((t) => str(t));
  return v.id === 'me' && str(v.businessName) && logoOk && templatesOk &&
    optStr(v.lastBackupAt) && count(v.schemaVersion);
}

const positive = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v > 0;

function isRecipeLine(v: unknown): boolean {
  return isObject(v) && str(v.ingredientId) && positive(v.qty);
}

function isRecipePart(v: unknown): boolean {
  return isObject(v) && str(v.name) && isArrayOf(v.lines, isRecipeLine);
}

function isProduct(v: unknown): boolean {
  return isObject(v) && str(v.id) && str(v.name) && count(v.price) &&
    typeof v.active === 'boolean' && str(v.createdAt) &&
    (v.parts === undefined || isArrayOf(v.parts, isRecipePart));
}

function isIngredient(v: unknown): boolean {
  return isObject(v) && str(v.id) && str(v.name) && oneOf(['g', 'ml', 'pcs'])(v.unit) &&
    positive(v.packQty) && count(v.packPrice) && str(v.createdAt);
}

function isCustomer(v: unknown): boolean {
  return isObject(v) && str(v.id) && str(v.name) && str(v.phone) && str(v.notes) &&
    str(v.createdAt);
}

function isOrderItem(v: unknown): boolean {
  return isObject(v) && optStr(v.productId) && str(v.name) && count(v.qty) &&
    count(v.unitPrice) && optCount(v.unitCost) && str(v.details);
}

function isOrder(v: unknown): boolean {
  return isObject(v) && str(v.id) && str(v.customerId) && str(v.title) &&
    isArrayOf(v.items, isOrderItem) && optCount(v.guests) && optStr(v.eventDate) &&
    str(v.deliveryDate) && oneOf(['pickup', 'delivery'])(v.fulfilment) &&
    optStr(v.address) && str(v.designNotes) &&
    oneOf(['new', 'confirmed', 'delivered', 'cancelled'])(v.status) &&
    count(v.total) && count(v.paidAmount) && optStr(v.paidAt) && optMethod(v.paidMethod) &&
    optCount(v.deposit) && optStr(v.depositPaidAt) && optMethod(v.depositMethod) &&
    str(v.notes) && str(v.createdAt) && str(v.updatedAt);
}
