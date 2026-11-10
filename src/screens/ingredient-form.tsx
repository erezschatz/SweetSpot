import { useEffect, useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Ingredient } from '../db/schema';
import { ingredientsRepo, productsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import {
  displayUnitCost,
  usedIngredientIds,
  ingredientFromDraft,
  parseQuantity,
  units,
  validateIngredient,
  type IngredientDraft,
  type IngredientError,
} from '../lib/costing';
import { agorotToInput, formatShekels, parseShekels } from '../lib/money';
import { selectAll } from '../ui/inputs';
import { navigate, returnTo } from '../ui/router';

const emptyDraft: IngredientDraft = { name: '', unit: 'g', packQty: '', packPrice: '' };

/** New ingredient when `id` is absent; otherwise edits (or deletes) that ingredient. */
export function IngredientFormScreen({ id }: { id?: string }) {
  const [existing, setExisting] = useState<Ingredient | null | undefined>(id ? undefined : null);
  const [draft, setDraft] = useState<IngredientDraft>(emptyDraft);
  const [errors, setErrors] = useState<IngredientError[]>([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const products = useLiveQuery(() => productsRepo.all(), [], []);

  // Editing: load once; later database changes do not overwrite her typing.
  useEffect(() => {
    if (!id) return;
    void (async () => {
      const ingredient = await ingredientsRepo.get(id);
      if (!ingredient) return navigate({ name: 'ingredients' }, { replace: true });
      setExisting(ingredient);
      setDraft({
        name: ingredient.name,
        unit: ingredient.unit,
        packQty: String(ingredient.packQty),
        packPrice: agorotToInput(ingredient.packPrice),
      });
    })();
  }, [id]);

  if (existing === undefined) return null;
  const set = (changes: Partial<IngredientDraft>) => setDraft({ ...draft, ...changes });

  // The derived price, live, once both numbers read.
  const packQty = parseQuantity(draft.packQty);
  const packPrice = parseShekels(draft.packPrice);
  const live = packQty !== null && packPrice !== null && packPrice >= 0 ? { unit: draft.unit, packQty, packPrice } : null;

  async function save() {
    if (saving) return;
    const found = validateIngredient(draft);
    setErrors(found);
    setMessage('');
    if (found.length > 0) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await ingredientsRepo.put(ingredientFromDraft(draft, existing?.id ?? crypto.randomUUID(), now, existing ?? undefined));
      returnTo({ name: 'ingredients' });
    } catch {
      setMessage(he.ingredients.saveFailed);
      setSaving(false);
    }
  }

  async function remove() {
    if (!existing) return;
    // Refused before asking: "delete?" followed by "cannot delete" asks a question with no yes (D43).
    if (usedIngredientIds(products).has(existing.id)) return setMessage(he.ingredients.inUse);
    if (!confirm(he.ingredients.removeConfirm)) return;
    try {
      if (await ingredientsRepo.deleteIfUnused(existing.id)) returnTo({ name: 'ingredients' });
      else setMessage(he.ingredients.inUse);
    } catch {
      setMessage(he.ingredients.removeFailed);
    }
  }

  return (
    <section class="form">
      <h2>{existing ? he.ingredients.editTitle : he.ingredients.newTitle}</h2>

      <label class="field">
        <span>{he.ingredients.name}</span>
        <input
          type="text"
          value={draft.name}
          placeholder={he.ingredients.namePlaceholder}
          onInput={(e) => set({ name: e.currentTarget.value })}
        />
      </label>

      <div class="field">
        <span>{he.ingredients.unit}</span>
        <div class="segmented">
          {units.map((u) => (
            <button type="button" key={u} class={draft.unit === u ? 'on' : ''} aria-pressed={draft.unit === u} onClick={() => set({ unit: u })}>
              {he.ingredients.units[u]}
            </button>
          ))}
        </div>
      </div>

      <div class="two">
        <label class="field">
          <span>
            {he.ingredients.packQty} ({he.ingredients.units[draft.unit]})
          </span>
          <input type="text" inputMode="decimal" value={draft.packQty} onFocus={selectAll} onInput={(e) => set({ packQty: e.currentTarget.value })} />
        </label>
        <label class="field">
          <span>{he.ingredients.packPrice}</span>
          <input type="text" inputMode="decimal" value={draft.packPrice} onFocus={selectAll} onInput={(e) => set({ packPrice: e.currentTarget.value })} />
        </label>
      </div>
      {live && (
        <p class="message">
          {formatShekels(displayUnitCost(live))} {he.ingredients.perUnit[live.unit]}
        </p>
      )}
      {existing && <p class="muted">{he.ingredients.priceNote}</p>}

      {errors.length > 0 && (
        <ul class="errors" role="alert">
          {errors.map((e) => <li key={e}>{he.ingredients.errors[e]}</li>)}
        </ul>
      )}
      {message && <p class="errors" role="alert">{message}</p>}

      <div class="actions">
        <button type="button" disabled={saving} onClick={() => void save()}>{he.ingredients.save}</button>
        {existing && <button type="button" class="secondary" onClick={() => void remove()}>{he.ingredients.remove}</button>}
        <button type="button" class="secondary" onClick={() => history.back()}>{he.orderForm.cancel}</button>
      </div>
    </section>
  );
}
