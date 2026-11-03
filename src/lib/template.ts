import type { Order } from '../db/schema';
import { formatDay } from './dates';
import { formatShekels } from './money';
import { outstanding, paidSoFar } from './orders';

// The four WhatsApp messages are templates she can edit in settings, with placeholders
// in braces. The default texts are Hebrew and live in src/i18n/he.ts; this file only
// fills them.

export const placeholders = [
  'name',
  'items',
  'guests',
  'eventDate',
  'deliveryDate',
  'total',
  'paid',
  'owes',
  'business',
] as const;

export type Placeholder = (typeof placeholders)[number];
export type TemplateValues = Record<Placeholder, string>;

/**
 * The text to send: her version, unless she has none or emptied it, in which case the
 * default. An emptied box would otherwise open WhatsApp with an empty message.
 */
export function templateText(saved: string | undefined, defaultText: string): string {
  return saved !== undefined && saved.trim() !== '' ? saved : defaultText;
}

/**
 * What each placeholder says for this order. A value is empty when there is nothing to
 * say (no event date, nothing paid yet, nothing owed), so fillTemplate can drop its line.
 */
export function templateValues(
  order: Pick<Order, 'title' | 'items' | 'guests' | 'eventDate' | 'deliveryDate' | 'total' | 'deposit' | 'depositPaidAt' | 'paidAmount' | 'paidAt'>,
  customerName: string,
  businessName: string,
): TemplateValues {
  const paid = paidSoFar(order);
  const owes = outstanding(order);
  return {
    name: customerName.trim() || order.title,
    items: order.items
      .map((item) => {
        const what = `${item.qty > 1 ? `${item.qty} × ` : ''}${item.name}`;
        return `• ${item.details ? `${what}, ${item.details}` : what}`;
      })
      .join('\n'),
    guests: order.guests === undefined ? '' : String(order.guests),
    eventDate: order.eventDate ? formatDay(order.eventDate) : '',
    deliveryDate: formatDay(order.deliveryDate),
    total: order.total > 0 ? formatShekels(order.total) : '',
    paid: paid > 0 ? formatShekels(paid) : '',
    owes: owes > 0 ? formatShekels(owes) : '',
    business: businessName.trim(),
  };
}

/**
 * Replaces each {placeholder} with its value. A line holding a placeholder whose value is
 * empty is left out whole, so "אורחים: {guests}" disappears for an order without guests
 * instead of being sent half-empty. Braces that are not a known placeholder stay as typed.
 */
export function fillTemplate(template: string, values: TemplateValues): string {
  const kept: string[] = [];
  for (const line of template.split('\n')) {
    const keys = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter(isPlaceholder);
    if (keys.some((key) => values[key] === '')) continue;
    kept.push(line.replace(/\{(\w+)\}/g, (match, key: string) => (isPlaceholder(key) ? values[key] : match)));
  }
  return kept.join('\n').trim();
}

function isPlaceholder(key: string | undefined): key is Placeholder {
  return (placeholders as readonly (string | undefined)[]).includes(key);
}
