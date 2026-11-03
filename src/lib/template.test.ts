import { describe, expect, it } from 'vitest';
import { fillTemplate, placeholders, templateText, templateValues, type TemplateValues } from './template';
import { he } from '../i18n/he';
import { formatShekels } from './money';

// Her notebook order, with a ₪100 deposit paid.
const order = {
  title: 'דנה לוי',
  items: [
    { name: 'עוגת פרחים', qty: 1, unitPrice: 32000, details: '4 שכבות, שוקולד + שוקולד, פרווה' },
    { name: 'קאפקייקס', qty: 12, unitPrice: 800, details: '' },
  ],
  guests: 30,
  eventDate: '2026-11-20',
  deliveryDate: '2026-11-19',
  total: 41600,
  deposit: 10000,
  depositPaidAt: '2026-11-02',
  paidAmount: 0,
};

describe('templateValues', () => {
  const values = templateValues(order, 'דנה לוי', ' העוגות של נועה ');

  it('writes one line per item, with quantity and details in her notation', () => {
    expect(values.items).toBe('• עוגת פרחים, 4 שכבות, שוקולד + שוקולד, פרווה\n• 12 × קאפקייקס');
  });

  it('formats dates and money in Hebrew', () => {
    expect(values.deliveryDate).toBe('יום ה׳, 19 בנוב׳');
    expect(values.eventDate).toBe('יום ו׳, 20 בנוב׳');
    expect([values.total, values.paid, values.owes]).toEqual([formatShekels(41600), formatShekels(10000), formatShekels(31600)]);
    expect([values.guests, values.business, values.name]).toEqual(['30', 'העוגות של נועה', 'דנה לוי']);
  });

  it('leaves empty what there is nothing to say about', () => {
    const bare = templateValues(
      { ...order, guests: undefined, eventDate: undefined, deposit: undefined, depositPaidAt: undefined },
      '',
      '',
    );
    expect([bare.guests, bare.eventDate, bare.paid, bare.business]).toEqual(['', '', '', '']);
    expect(bare.name).toBe('דנה לוי');
    const paidUp = templateValues({ ...order, paidAmount: 31600, paidAt: '2026-11-20' }, 'דנה', '');
    expect(paidUp.owes).toBe('');
  });
});

describe('templateText', () => {
  it('uses her version, or the default when she has none or emptied it', () => {
    expect(templateText('היי {name}', 'שלום {name}')).toBe('היי {name}');
    expect(templateText(undefined, 'שלום {name}')).toBe('שלום {name}');
    expect(templateText(' \n ', 'שלום {name}')).toBe('שלום {name}');
  });
});

describe('fillTemplate', () => {
  const values: TemplateValues = {
    name: 'דנה', items: '• עוגה', guests: '', eventDate: '', deliveryDate: 'יום ה׳, 19 בנוב׳',
    total: '320 ₪', paid: '', owes: '320 ₪', business: 'העוגות של נועה',
  };

  it('fills every placeholder, more than once if needed', () => {
    expect(fillTemplate('שלום {name}, {name}!\nסה״כ {total}', values)).toBe('שלום דנה, דנה!\nסה״כ 320 ₪');
  });

  it('drops a whole line whose placeholder is empty, and keeps plain lines', () => {
    const template = 'שלום {name}\nאורחים: {guests}\nמסירה: {deliveryDate}\n\nתודה!\n{business}';
    expect(fillTemplate(template, values)).toBe('שלום דנה\nמסירה: יום ה׳, 19 בנוב׳\n\nתודה!\nהעוגות של נועה');
  });

  it('keeps braces it does not know, as she typed them', () => {
    expect(fillTemplate('{name} {שם} {foo}', values)).toBe('דנה {שם} {foo}');
  });

  it('expands a multi-line items list in place', () => {
    expect(fillTemplate('הזמנה:\n{items}', { ...values, items: '• עוגה\n• 12 × קאפקייקס' })).toBe('הזמנה:\n• עוגה\n• 12 × קאפקייקס');
  });
});

describe('the default messages in he.ts', () => {
  it('use only placeholders the app knows, and say who it is from', () => {
    for (const text of Object.values(he.whatsapp.defaults)) {
      const used = [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      expect(used.every((key) => (placeholders as readonly string[]).includes(key!))).toBe(true);
      expect(used).toContain('name');
      expect(used).toContain('business');
    }
  });

  it('turn her notebook order into a readable "order accepted" message', () => {
    const text = fillTemplate(he.whatsapp.defaults.accepted, templateValues(order, 'דנה לוי', 'העוגות של נועה'));
    expect(text.split('\n')).toEqual([
      'שלום דנה לוי, תודה על ההזמנה!',
      'זה מה שרשמתי:',
      '• עוגת פרחים, 4 שכבות, שוקולד + שוקולד, פרווה',
      '• 12 × קאפקייקס',
      'מסירה: יום ה׳, 19 בנוב׳',
      'אירוע: יום ו׳, 20 בנוב׳',
      'מספר אורחים: 30',
      `סה״כ: ${formatShekels(41600)}`,
      `שולם מראש: ${formatShekels(10000)}`,
      '',
      'אפשר לאשר שהכול נכון?',
      'העוגות של נועה',
    ]);
  });
});
