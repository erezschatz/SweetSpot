import type { Customer } from '../db/schema';

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
