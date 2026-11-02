// Dates are stored as ISO `YYYY-MM-DD` in the phone's own time zone, not UTC:
// an order for "today" made at 01:00 in Israel must not land on yesterday.

export function localIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
