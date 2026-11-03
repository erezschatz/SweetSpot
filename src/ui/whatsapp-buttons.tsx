import { useLiveQuery } from 'dexie-react-hooks';
import type { Customer, Order, TemplateKey } from '../db/schema';
import { settingsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { toWhatsAppNumber, whatsAppLink } from '../lib/phone';
import { fillTemplate, templateText, templateValues } from '../lib/template';

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
            href={whatsAppLink(number, fillTemplate(templateText(settings.templates[key], he.whatsapp.defaults[key]), values))}
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
