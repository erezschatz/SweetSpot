import { useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import { customersRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { findByPhone, matchCustomers } from '../lib/customers';
import type { CustomerChoice } from '../lib/order-draft';
import { canPickContact, pickContact } from './contacts';

const MAX_MATCHES = 6;

// Search first, because most orders are from people she has baked for before. "New"
// carries over what she typed, so a search that found nobody is not wasted typing.
export function CustomerPicker({
  value,
  onChange,
}: {
  value: CustomerChoice | null;
  onChange: (choice: CustomerChoice | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [contactsFailed, setContactsFailed] = useState(false);
  const customers = useLiveQuery(() => customersRepo.all(), [], []);

  // Same path as the customers screen (step 05). A contact already on file is picked as
  // that customer, so ordering twice from the same contact does not make a second one.
  async function fromContacts() {
    setContactsFailed(false);
    try {
      const picked = await pickContact();
      if (!picked) return;
      const known = findByPhone(customers, picked.phone);
      onChange(known ? { kind: 'existing', id: known.id, name: known.name } : { kind: 'new', ...picked });
    } catch {
      setContactsFailed(true);
    }
  }

  const contactsButton = canPickContact() && (
    <button type="button" class="secondary" onClick={() => void fromContacts()}>
      {he.customers.fromContacts}
    </button>
  );
  const contactsError = contactsFailed && <p class="errors" role="alert">{he.customers.contactsFailed}</p>;

  // Whatever she does next, an old "could not open contacts" no longer applies.
  function choose(choice: CustomerChoice | null) {
    setContactsFailed(false);
    onChange(choice);
  }

  if (value?.kind === 'existing') {
    const phone = customers.find((c) => c.id === value.id)?.phone;
    return (
      <div class="picked">
        <span>
          <strong>{value.name}</strong>
          {phone && <span class="muted"> · {phone}</span>}
        </span>
        <button type="button" class="secondary" onClick={() => choose(null)}>{he.orderForm.change}</button>
      </div>
    );
  }

  if (value?.kind === 'new') {
    return (
      <div class="subform">
        <label class="field">
          <span>{he.orderForm.customerName}</span>
          <input type="text" value={value.name} onInput={(e) => choose({ ...value, name: e.currentTarget.value })} />
        </label>
        <label class="field">
          <span>{he.orderForm.customerPhone}</span>
          <input type="tel" dir="ltr" value={value.phone} onInput={(e) => choose({ ...value, phone: e.currentTarget.value })} />
        </label>
        {contactsButton}
        {contactsError}
        <button type="button" class="secondary" onClick={() => choose(null)}>{he.orderForm.change}</button>
      </div>
    );
  }

  const matches = query.trim() ? matchCustomers(customers, query).slice(0, MAX_MATCHES) : [];
  const typedDigits = /^[\d\s+()-]+$/.test(query.trim());

  return (
    <div class="subform">
      <input
        type="search"
        value={query}
        placeholder={he.orderForm.searchCustomer}
        onInput={(e) => setQuery(e.currentTarget.value)}
      />
      {matches.length > 0 && (
        <ul class="choices">
          {matches.map((c) => (
            <li key={c.id}>
              <button type="button" class="choice" onClick={() => choose({ kind: 'existing', id: c.id, name: c.name })}>
                <strong>{c.name}</strong> <span class="muted" dir="ltr">{c.phone}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim() && matches.length === 0 && <p class="muted">{he.orderForm.noMatches}</p>}
      <button
        type="button"
        class="secondary"
        onClick={() =>
          choose({ kind: 'new', name: typedDigits ? '' : query.trim(), phone: typedDigits ? query.trim() : '' })
        }
      >
        + {he.orderForm.newCustomer}
      </button>
      {contactsButton}
      {contactsError}
    </div>
  );
}
