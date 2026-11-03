import type { Customer, Order } from '../db/schema';
import { sum, type Agorot } from './money';
import { paidSoFar } from './orders';
import { toWhatsAppNumber } from './phone';

// Search by what she remembers: part of a name, or a few digits of the number in any
// format ("0501", "050-1", "972501").
export function matchCustomers(customers: Customer[], query: string): Customer[] {
  const q = query.trim().toLowerCase();
  if (q === '') return customers;
  const digits = q.replace(/\D/g, '');
  return customers.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true;
    if (digits.length < 2) return false;
    const phone = c.phone.replace(/\D/g, '');
    // A query starting 972 should also find a number stored as 05x, and vice versa.
    const local = (s: string) => s.replace(/^972/, '0');
    return phone.includes(digits) || local(phone).includes(local(digits));
  });
}

/** What the Contact Picker hands back for one contact: arrays, any of them possibly empty. */
export interface PickedContact {
  name?: string[];
  tel?: string[];
}

/**
 * The name and number to put on a new customer. A contact can carry several numbers;
 * an Israeli mobile is preferred, because that is where WhatsApp goes.
 */
export function fromContact(contact: PickedContact): { name: string; phone: string } {
  const name = (contact.name ?? []).map((n) => n.trim()).find((n) => n !== '') ?? '';
  const tels = (contact.tel ?? []).map((t) => t.trim()).filter((t) => t !== '');
  const mobile = tels.find((t) => toWhatsAppNumber(t)?.startsWith('9725'));
  return { name, phone: mobile ?? tels[0] ?? '' };
}

/** The customer already on file with this number, written any way, so a contact picked twice is not a second customer. */
export function findByPhone(customers: Customer[], phone: string, exceptId?: string): Customer | undefined {
  const wanted = toWhatsAppNumber(phone);
  if (wanted === null) return undefined;
  return customers.find((c) => c.id !== exceptId && toWhatsAppNumber(c.phone) === wanted);
}

/** A customer's orders, newest delivery first, and what she has paid over all of them. */
export function customerHistory<T extends Pick<Order, 'deliveryDate' | 'createdAt' | 'total' | 'deposit' | 'depositPaidAt' | 'paidAmount' | 'paidAt'>>(
  orders: T[],
): { orders: T[]; totalPaid: Agorot } {
  const sorted = [...orders].sort(
    (a, b) => b.deliveryDate.localeCompare(a.deliveryDate) || b.createdAt.localeCompare(a.createdAt),
  );
  // Money that came in counts even on a cancelled order: a kept deposit was still paid.
  return { orders: sorted, totalPaid: sum(orders.map(paidSoFar)) };
}
