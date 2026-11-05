// Money is stored as integer agorot (D14). Shekels appear only at the edges:
// parsing what the baker types and formatting what she sees.

export type Agorot = number;

const formatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatShekels(amount: Agorot): string {
  return formatter.format(amount / 100);
}

/** "120", "120.5", "₪1,200", "1200 ש"ח" → agorot. Returns null when there is no number. */
export function parseShekels(text: string): Agorot | null {
  const cleaned = text.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  // `|| 0` turns -0 (from "-0") into 0, so it is neither stored nor shown as "-₪0".
  return Math.round(value * 100) || 0;
}

/** Agorot → the text an input field starts with: "320", "320.5", no symbol or separators. */
export function agorotToInput(amount: Agorot): string {
  return String(amount / 100);
}

export function sum(amounts: Agorot[]): Agorot {
  return amounts.reduce((total, a) => total + a, 0);
}
