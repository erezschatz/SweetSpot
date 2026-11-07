import { describe, expect, it } from 'vitest';
import type { Order } from '../db/schema';
import { backupDue, buildDiary, daysSinceBackup, totalOwed } from './diary';

// Thursday 2026-11-12: this week is Sun 8 – Sat 14, next week Sun 15 – Sat 21.
const today = '2026-11-12';

let seq = 0;
function order(deliveryDate: string, extra: Partial<Order> = {}): Order {
  seq += 1;
  return {
    id: `o${seq}`,
    customerId: 'c1',
    title: `order ${seq}`,
    items: [],
    deliveryDate,
    fulfilment: 'pickup',
    designNotes: '',
    status: 'confirmed',
    total: 30000,
    paidAmount: 0,
    notes: '',
    createdAt: `2026-11-01T10:00:${String(seq).padStart(2, '0')}.000Z`,
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...extra,
  };
}

const ids = (list: { id: string }[]) => list.map((o) => o.id);
const section = (diary: ReturnType<typeof buildDiary<Order>>, key: string) =>
  diary.sections.find((s) => s.key === key)!;

describe('buildDiary', () => {
  it('puts each open order in its section by delivery date', () => {
    const t = order('2026-11-12');
    const fri = order('2026-11-13');
    const sat = order('2026-11-14');
    const sun = order('2026-11-15');
    const nextSat = order('2026-11-21');
    const later = order('2026-11-22');
    const diary = buildDiary([later, nextSat, sun, sat, fri, t], today);

    expect(diary.sections.map((s) => s.key)).toEqual(['today', 'thisWeek', 'nextWeek', 'later']);
    expect(section(diary, 'today').days.flatMap((d) => ids(d.orders))).toEqual([t.id]);
    expect(section(diary, 'thisWeek').days.map((d) => d.date)).toEqual(['2026-11-13', '2026-11-14']);
    expect(section(diary, 'nextWeek').days.map((d) => d.date)).toEqual(['2026-11-15', '2026-11-21']);
    expect(section(diary, 'later').days.map((d) => d.date)).toEqual(['2026-11-22']);
  });

  it('on a Saturday, "this week" is empty and Sunday is next week', () => {
    const sun = order('2026-11-15');
    const diary = buildDiary([sun], '2026-11-14');
    expect(section(diary, 'thisWeek').days).toEqual([]);
    expect(section(diary, 'nextWeek').days.map((d) => d.date)).toEqual(['2026-11-15']);
  });

  it('on a Sunday, the whole week ahead is "this week"', () => {
    const sat = order('2026-11-14');
    const diary = buildDiary([sat], '2026-11-08');
    expect(section(diary, 'thisWeek').days.map((d) => d.date)).toEqual(['2026-11-14']);
  });

  it('groups a day and lists confirmed before new, then by when they were taken', () => {
    const newFirst = order('2026-11-13', { status: 'new' });
    const confirmedA = order('2026-11-13');
    const confirmedB = order('2026-11-13');
    const day = section(buildDiary([confirmedB, newFirst, confirmedA], today), 'thisWeek').days;
    expect(day).toHaveLength(1);
    expect(ids(day[0]!.orders)).toEqual([confirmedA.id, confirmedB.id, newFirst.id]);
  });

  it('leaves delivered and cancelled orders out of the sections', () => {
    const diary = buildDiary(
      [order('2026-11-13', { status: 'delivered', paidAmount: 30000, paidAt: '2026-11-13' }), order('2026-11-13', { status: 'cancelled' })],
      today,
    );
    expect(diary.sections.every((s) => s.days.length === 0)).toBe(true);
  });

  it('lists open orders whose date has passed as overdue, oldest first, and nowhere else', () => {
    const older = order('2026-11-02');
    const yesterday = order('2026-11-11', { status: 'new' });
    const done = order('2026-11-10', { status: 'delivered', paidAmount: 30000, paidAt: '2026-11-10' });
    const diary = buildDiary([yesterday, done, older], today);
    expect(ids(diary.overdue)).toEqual([older.id, yesterday.id]);
    expect(diary.sections.every((s) => s.days.length === 0)).toBe(true);
  });

  it('an order due today is not overdue', () => {
    expect(buildDiary([order(today)], today).overdue).toEqual([]);
  });

  it('lists delivered orders that still owe, whatever their date', () => {
    const owes = order('2026-11-10', { status: 'delivered' });
    const deposit = order('2026-11-05', { status: 'delivered', deposit: 10000, depositPaidAt: '2026-11-01' });
    const paid = order('2026-11-09', { status: 'delivered', paidAmount: 30000, paidAt: '2026-11-09' });
    const open = order('2026-11-13');
    const diary = buildDiary([owes, paid, open, deposit], today);
    expect(ids(diary.unpaid)).toEqual([deposit.id, owes.id]);
    expect(totalOwed(diary.unpaid)).toBe(20000 + 30000);
  });
});

describe('backupDue', () => {
  it('is due when there has never been a backup', () => {
    expect(backupDue(undefined, today)).toBe(true);
    expect(daysSinceBackup(undefined, today)).toBeNull();
  });

  it('is not due within the week', () => {
    expect(backupDue(new Date(2026, 10, 12, 9).toISOString(), today)).toBe(false);
    expect(backupDue(new Date(2026, 10, 6, 23, 30).toISOString(), today)).toBe(false);
    expect(daysSinceBackup(new Date(2026, 10, 6, 23, 30).toISOString(), today)).toBe(6);
  });

  it('is due a week later by the calendar, whatever the hour', () => {
    expect(backupDue(new Date(2026, 10, 5, 23, 59).toISOString(), today)).toBe(true);
    expect(backupDue(new Date(2026, 9, 1).toISOString(), today)).toBe(true);
  });
});
