// WhatsApp's wa.me links take the number in international form, digits only
// (972501234567). Customers' numbers are stored as she typed them, so they are
// normalised at the moment a message is sent.

/**
 * An Israeli number in any usual shape (050-1234567, 0501234567, +972 50 123 4567,
 * 00972…) becomes 972 and the number without its 0: 972501234567. A number written with + or 00 and another country
 * code is kept as it is. Returns null when it cannot be a phone number.
 */
export function toWhatsAppNumber(phone: string): string | null {
  // Direction marks come along with numbers pasted from RTL text or from contacts.
  const trimmed = phone.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').trim();
  let digits = trimmed.replace(/\D/g, '');
  const international = trimmed.startsWith('+') || digits.startsWith('00');
  if (digits.startsWith('00')) digits = digits.slice(2);

  if (digits.startsWith('972')) {
    // "+972 050…" is a common mix of both forms; the trunk 0 does not belong after 972.
    let rest = digits.slice(3);
    if (rest.startsWith('0')) rest = rest.slice(1);
    return israeli(rest);
  }
  if (international) return digits.length >= 8 && digits.length <= 15 ? digits : null;
  if (digits.startsWith('0')) return israeli(digits.slice(1));
  return null;
}

// Without the trunk 0: mobiles have 9 digits (5x-xxxxxxx), landlines 8 (x-xxxxxxx).
function israeli(national: string): string | null {
  return national.length === 8 || national.length === 9 ? `972${national}` : null;
}

export function whatsAppLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
