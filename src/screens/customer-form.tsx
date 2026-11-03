import { useEffect, useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Customer } from '../db/schema';
import { customersRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { findByPhone } from '../lib/customers';
import { href } from '../lib/route';
import { canPickContact, pickContact } from '../ui/contacts';
import { navigate, returnTo } from '../ui/router';

/** New customer when `id` is absent; otherwise edits that customer. */
export function CustomerFormScreen({ id }: { id?: string }) {
  const [existing, setExisting] = useState<Customer | null | undefined>(id ? undefined : null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameMissing, setNameMissing] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const customers = useLiveQuery(() => customersRepo.all(), [], []);

  // Editing: load once; later database changes do not overwrite her typing.
  useEffect(() => {
    if (!id) return;
    void (async () => {
      const customer = await customersRepo.get(id);
      if (!customer) return navigate({ name: 'customers' }, { replace: true });
      setExisting(customer);
      setName(customer.name);
      setPhone(customer.phone);
    })();
  }, [id]);

  if (existing === undefined) return null;

  // Shown, not enforced: two people can share a home phone.
  const sameNumber = findByPhone(customers, phone, existing?.id);

  async function fromContacts() {
    try {
      const picked = await pickContact();
      if (!picked) return;
      if (picked.name) setName(picked.name);
      if (picked.phone) setPhone(picked.phone);
    } catch {
      setMessage(he.customers.contactsFailed);
    }
  }

  async function save() {
    if (saving) return;
    if (name.trim() === '') return setNameMissing(true);
    setSaving(true);
    try {
      if (existing) {
        await customersRepo.save({ ...existing, name: name.trim(), phone: phone.trim() });
        returnTo({ name: 'customer', id: existing.id });
      } else {
        const customer: Customer = {
          id: crypto.randomUUID(),
          name: name.trim(),
          phone: phone.trim(),
          notes: '',
          createdAt: new Date().toISOString(),
        };
        await customersRepo.put(customer);
        navigate({ name: 'customer', id: customer.id }, { replace: true });
      }
    } catch {
      setMessage(he.customers.saveFailed);
      setSaving(false);
    }
  }

  return (
    <section class="form">
      <h2>{existing ? he.customers.editTitle : he.customers.newTitle}</h2>

      {canPickContact() && (
        <button type="button" class="secondary" onClick={() => void fromContacts()}>
          {he.customers.fromContacts}
        </button>
      )}

      <label class="field">
        <span>{he.customers.name}</span>
        <input type="text" value={name} onInput={(e) => { setName(e.currentTarget.value); setNameMissing(false); }} />
      </label>
      <label class="field">
        <span>{he.customers.phone}</span>
        <input type="tel" dir="ltr" value={phone} onInput={(e) => setPhone(e.currentTarget.value)} />
      </label>
      {sameNumber && (
        <p class="message">
          {he.customers.phoneTaken} <a href={href({ name: 'customer', id: sameNumber.id })}>{sameNumber.name}</a>
        </p>
      )}

      {nameMissing && <p class="errors" role="alert">{he.customers.nameMissing}</p>}
      {message && <p class="errors" role="alert">{message}</p>}

      <div class="actions">
        <button type="button" disabled={saving} onClick={() => void save()}>{he.customers.save}</button>
        <button type="button" class="secondary" onClick={() => history.back()}>{he.orderForm.cancel}</button>
      </div>
    </section>
  );
}
