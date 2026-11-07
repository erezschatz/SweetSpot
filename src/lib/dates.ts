// Dates are stored as ISO `YYYY-MM-DD` in the phone's own time zone, not UTC:
// an order for "today" made at 01:00 in Israel must not land on yesterday.

export function localIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** `YYYY-MM-DD` → a Date at local midnight. `new Date('2026-11-19')` would be UTC midnight. */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

const dayFormat = new Intl.DateTimeFormat('he-IL', { weekday: 'short', day: 'numeric', month: 'short' });

/** "יום ה׳, 19 בנוב׳" — how a delivery or event date is shown. */
export function formatDay(iso: string): string {
  return dayFormat.format(parseIsoDate(iso));
}

/** `YYYY-MM-DD` moved by whole days. Through a local Date, so a DST change cannot skip or repeat a day. */
export function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return localIsoDate(d);
}

/** The Sunday that opens the week holding `iso`: an Israeli week runs Sunday to Saturday. */
export function weekStart(iso: string): string {
  return addDays(iso, -parseIsoDate(iso).getDay());
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  // Rounded: a DST night makes one local day 23 or 25 hours long.
  return Math.round((parseIsoDate(to).getTime() - parseIsoDate(from).getTime()) / 86_400_000);
}

const weekdayFormat = new Intl.DateTimeFormat('he-IL', { weekday: 'long' });

/** "יום חמישי" — the heading of a day in the diary. */
export function weekdayName(iso: string): string {
  return weekdayFormat.format(parseIsoDate(iso));
}
