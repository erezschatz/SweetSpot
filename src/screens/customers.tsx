import { useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import { customersRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { matchCustomers } from '../lib/customers';
import { href } from '../lib/route';

export function CustomersScreen() {
  const [query, setQuery] = useState('');
  const customers = useLiveQuery(() => customersRepo.all());
  if (!customers) return null;

  const shown = matchCustomers(customers, query);

  return (
    <section>
      <h2>{he.customers.title}</h2>
      <input
        type="search"
        value={query}
        placeholder={he.customers.search}
        onInput={(e) => setQuery(e.currentTarget.value)}
      />

      {customers.length === 0 && <p class="muted">{he.customers.empty}</p>}
      {customers.length > 0 && shown.length === 0 && <p class="muted">{he.customers.noMatches}</p>}
      <ul class="cards customer-list">
        {shown.map((c) => (
          <li key={c.id}>
            <a class="card" href={href({ name: 'customer', id: c.id })}>
              <div class="card-top">
                <strong>{c.name}</strong>
                <span class="muted" dir="ltr">{c.phone}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <a class="fab" href={href({ name: 'customerNew' })}>+ {he.customers.newCustomer}</a>
    </section>
  );
}
