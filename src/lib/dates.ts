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
