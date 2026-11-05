import { useEffect, useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Product } from '../db/schema';
import { productsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { agorotToInput } from '../lib/money';
import { findByName, productFromDraft, validateProduct, type ProductError } from '../lib/products';
import { selectAll } from '../ui/inputs';
import { navigate, returnTo } from '../ui/router';

/** New product when `id` is absent; otherwise edits (or retires) that product. */
export function ProductFormScreen({ id }: { id?: string }) {
  const [existing, setExisting] = useState<Product | null | undefined>(id ? undefined : null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<ProductError[]>([]);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const products = useLiveQuery(() => productsRepo.all(), [], []);

  // Editing: load once; later database changes do not overwrite her typing.
  useEffect(() => {
    if (!id) return;
    void (async () => {
      const product = await productsRepo.get(id);
      if (!product) return navigate({ name: 'products' }, { replace: true });
      setExisting(product);
      setName(product.name);
      setPrice(agorotToInput(product.price));
      setActive(product.active);
    })();
  }, [id]);

  if (existing === undefined) return null;

  // Shown, not enforced: "עוגת פרחים" in two sizes may share a name on purpose.
  const sameName = findByName(products, name, existing?.id);

  async function save() {
    if (saving) return;
    const found = validateProduct({ name, price });
    setErrors(found);
    setSaveFailed(false);
    if (found.length > 0) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await productsRepo.put(productFromDraft({ name, price, active }, existing?.id ?? crypto.randomUUID(), now, existing ?? undefined));
      returnTo({ name: 'products' });
    } catch {
      setSaveFailed(true);
      setSaving(false);
    }
  }

  return (
    <section class="form">
      <h2>{existing ? he.products.editTitle : he.products.newTitle}</h2>

      <label class="field">
        <span>{he.products.name}</span>
        <input
          type="text"
          value={name}
          placeholder={he.products.namePlaceholder}
          onInput={(e) => setName(e.currentTarget.value)}
        />
      </label>
      {sameName && <p class="message">{he.products.nameTaken} {sameName.name}</p>}

      <label class="field">
        <span>{he.products.price}</span>
        <input
          type="text"
          inputMode="decimal"
          value={price}
          onFocus={selectAll}
          onInput={(e) => setPrice(e.currentTarget.value)}
        />
      </label>
      {existing && <p class="muted">{he.products.priceNote}</p>}

      {/* Retiring is part of editing: a new product is always on sale. */}
      {existing && (
        <>
          <label class="toggle">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.currentTarget.checked)} />
            <span>{he.products.active}</span>
          </label>
          <p class="muted">{he.products.activeHint}</p>
        </>
      )}

      {errors.length > 0 && (
        <ul class="errors" role="alert">
          {errors.map((e) => <li key={e}>{he.products.errors[e]}</li>)}
        </ul>
      )}
      {saveFailed && <p class="errors" role="alert">{he.products.saveFailed}</p>}

      <div class="actions">
        <button type="button" disabled={saving} onClick={() => void save()}>{he.products.save}</button>
        <button type="button" class="secondary" onClick={() => history.back()}>{he.orderForm.cancel}</button>
      </div>
    </section>
  );
}
