import { useLiveQuery } from 'dexie-react-hooks';
import type { Customer, Order, Settings, TemplateKey } from '../db/schema';
import { settingsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { toWhatsAppNumber, whatsAppLink } from '../lib/phone';
import { fillTemplate, templateText, templateValues, type TemplateValues } from '../lib/template';

const keys: TemplateKey[] = ['accepted', 'reminder', 'ready', 'payment'];

/**
 * The four messages of D17. Plain links to wa.me: Android hands them to the WhatsApp app
 * rather than opening a browser tab, and a link needs no script to count as her tap.
 */
export function WhatsAppButtons({ order, customer }: { order: Order; customer: Customer | null }) {
  const settings = useLiveQuery(() => settingsRepo.get());
  if (!settings || customer === null) return null;

  const number = toWhatsAppNumber(customer.phone);
  if (number === null) {
    return (
      <>
        <h3>{he.whatsapp.title}</h3>
        <p class="message">
          {customer.phone.trim() === '' ? (
            he.whatsapp.noPhone
          ) : (
            <>
              {he.whatsapp.badPhone} <bdi dir="ltr">{customer.phone}</bdi>
            </>
          )}
        </p>
      </>
    );
  }

  const values = templateValues(order, customer.name, settings.businessName);
  // A payment reminder with nothing owed would arrive as a bare "thank you".
  const offered = keys.filter((key) => key !== 'payment' || values.owes !== '');
  return (
    <>
      <h3>{he.whatsapp.title}</h3>
      <div class="whatsapp">
        {offered.map((key) => (
          <a
            key={key}
            class="button whatsapp-button"
            href={messageLink(number, key, values, settings)}
            target="_blank"
            rel="noopener"
          >
            {he.whatsapp.send[key]}
          </a>
        ))}
      </div>
    </>
  );
}

function messageLink(number: string, key: TemplateKey, values: TemplateValues, settings: Settings): string {
  return whatsAppLink(number, fillTemplate(templateText(settings.templates[key], he.whatsapp.defaults[key]), values));
}

/**
 * The payment reminder alone, for a row on the money screen. Nothing when there is no
 * number to send to or nothing owed; the order itself says why.
 */
export function paymentReminderLink(order: Order, customer: Customer | undefined, settings: Settings): string | null {
  if (!customer) return null;
  const number = toWhatsAppNumber(customer.phone);
  if (number === null) return null;
  const values = templateValues(order, customer.name, settings.businessName);
  if (values.owes === '') return null;
  return messageLink(number, 'payment', values, settings);
}
