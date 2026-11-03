import { describe, expect, it } from 'vitest';
import { toWhatsAppNumber, whatsAppLink } from './phone';

describe('toWhatsAppNumber', () => {
  it('turns every usual way of writing an Israeli mobile into 972…', () => {
    for (const typed of ['050-1234567', '0501234567', '+972 50 123 4567', '+972-50-1234567', '00972501234567', '972501234567', ' 050 123 4567 ']) {
      expect(toWhatsAppNumber(typed)).toBe('972501234567');
    }
  });

  it('drops a trunk 0 written after the country code', () => {
    expect(toWhatsAppNumber('+972 050-1234567')).toBe('972501234567');
  });

  it('accepts a landline', () => {
    expect(toWhatsAppNumber('03-1234567')).toBe('97231234567');
  });

  it('keeps a foreign number written with + or 00', () => {
    expect(toWhatsAppNumber('+44 20 7946 0958')).toBe('442079460958');
    expect(toWhatsAppNumber('0044 20 7946 0958')).toBe('442079460958');
  });

  it('ignores direction marks around a pasted number', () => {
    expect(toWhatsAppNumber('\u202a+44 20 7946 0958\u202c')).toBe('442079460958');
    expect(toWhatsAppNumber('\u200e050-1234567')).toBe('972501234567');
  });

  it('refuses what cannot be a number', () => {
    for (const typed of ['', 'אין', '050-123', '501234567', '0501234567890']) {
      expect(toWhatsAppNumber(typed)).toBeNull();
    }
  });
});

describe('whatsAppLink', () => {
  it('encodes Hebrew, new lines and symbols in the text', () => {
    expect(whatsAppLink('972501234567', 'שלום דנה\nסה״כ: 320 ₪ & תודה')).toBe(
      'https://wa.me/972501234567?text=%D7%A9%D7%9C%D7%95%D7%9D%20%D7%93%D7%A0%D7%94%0A%D7%A1%D7%94%D7%B4%D7%9B%3A%20320%20%E2%82%AA%20%26%20%D7%AA%D7%95%D7%93%D7%94',
    );
  });
});
