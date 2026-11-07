import type { Order } from '../db/schema';
import { addDays, daysBetween, localIsoDate, weekStart } from './dates';
import { sum, type Agorot } from './money';
import { outstanding, paymentBadge } from './orders';

// The front screen's arithmetic (step 07). Weeks run Sunday to Saturday. "Today" is the
// phone's local date, passed in so the tests can stand on any day.

export type SectionKey = 'today' | 'thisWeek' | 'nextWeek' | 'later';

export interface DiaryDay<T> {
  date: string;
  orders: T[];
}

export interface DiarySection<T> {
  key: SectionKey;
  days: DiaryDay<T>[];
}

export interface Diary<T> {
  /** Open orders whose delivery date has passed: the first thing she must see. */
  overdue: T[];
  /** Delivered and still owing: payment is after delivery (D16), so this is her "don't forget". */
  unpaid: T[];
  /** Always all four, in order; a section with nothing due has no days. */
  sections: DiarySection<T>[];
}

type DiaryOrder = Pick<
  Order,
  'status' | 'deliveryDate' | 'createdAt' | 'total' | 'deposit' | 'depositPaidAt' | 'paidAmount' | 'paidAt'
>;

const isOpen = (o: DiaryOrder) => o.status === 'new' || o.status === 'confirmed';

// Confirmed first: those are the cakes to bake. A new one still waits on a "yes".
const byDay = (a: DiaryOrder, b: DiaryOrder) =>
  a.deliveryDate.localeCompare(b.deliveryDate) ||
  Number(a.status === 'new') - Number(b.status === 'new') ||
  a.createdAt.localeCompare(b.createdAt);

export function buildDiary<T extends DiaryOrder>(orders: T[], today: string): Diary<T> {
  const nextWeek = addDays(weekStart(today), 7);
  const afterNextWeek = addDays(nextWeek, 7);

  const open = orders.filter(isOpen).sort(byDay);
  const inRange = (from: string, until: string | null) =>
    open.filter((o) => o.deliveryDate >= from && (until === null || o.deliveryDate < until));

  return {
    overdue: open.filter((o) => o.deliveryDate < today),
    unpaid: orders
      .filter((o) => paymentBadge(o) === 'owes')
      .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate) || a.createdAt.localeCompare(b.createdAt)),
    sections: [
      { key: 'today', days: groupByDay(inRange(today, addDays(today, 1))) },
      { key: 'thisWeek', days: groupByDay(inRange(addDays(today, 1), nextWeek)) },
      { key: 'nextWeek', days: groupByDay(inRange(nextWeek, afterNextWeek)) },
      { key: 'later', days: groupByDay(inRange(afterNextWeek, null)) },
    ],
  };
}

/** Orders already sorted by date, cut into one group per delivery date. */
function groupByDay<T extends DiaryOrder>(orders: T[]): DiaryDay<T>[] {
  const days: DiaryDay<T>[] = [];
  for (const order of orders) {
    const last = days[days.length - 1];
    if (last && last.date === order.deliveryDate) last.orders.push(order);
    else days.push({ date: order.deliveryDate, orders: [order] });
  }
  return days;
}

/** What the delivered-not-paid line adds up to. */
export function totalOwed(orders: DiaryOrder[]): Agorot {
  return sum(orders.map(outstanding));
}

export const backupEveryDays = 7;

/**
 * The weekly prompt (D39): no backup yet, or the last one a week or more ago. Counted in
 * local days, so a backup on Sunday evening prompts again on the next Sunday, whatever the hour.
 */
export function backupDue(lastBackupAt: string | undefined, today: string): boolean {
  if (!lastBackupAt) return true;
  return daysBetween(localIsoDate(new Date(lastBackupAt)), today) >= backupEveryDays;
}

/** Days since the last backup, for the prompt's wording; null when there has been none. */
export function daysSinceBackup(lastBackupAt: string | undefined, today: string): number | null {
  if (!lastBackupAt) return null;
  return daysBetween(localIsoDate(new Date(lastBackupAt)), today);
}
