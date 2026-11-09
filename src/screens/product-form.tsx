import { useEffect, useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Ingredient, Product } from '../db/schema';
import { ingredientsRepo, productsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import {
  draftAsRecipe,
  formatQty,
  formatShare,
  ingredientMap,
  margin,
  minimumMargin,
  parseQuantity,
  priceForMargin,
  productCost,
  recipeDraft,
  recipeFromDraft,
  recommendedMargin,
  scaleQty,
  validateRecipe,
  type PartDraft,
  type RecipeError,
} from '../lib/costing';
import { agorotToInput, formatShekels, parseShekels } from '../lib/money';
import { findByName, productFromDraft, validateProduct, type ProductError } from '../lib/products';
import { selectAll } from '../ui/inputs';
import { RecipeEditor } from '../ui/recipe-editor';
import { navigate, returnTo } from '../ui/router';

/** New product when `id` is absent; otherwise edits (or retires) that product. */
export function ProductFormScreen({ id }: { id?: string }) {
  const [existing, setExisting] = useState<Product | null | undefined>(id ? undefined : null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [parts, setParts] = useState<PartDraft[]>([]);
  const [scaleUnits, setScaleUnits] = useState('2');
  const [errors, setErrors] = useState<(ProductError | RecipeError)[]>([]);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const products = useLiveQuery(() => productsRepo.all(), [], []);
  // No default: an empty list would show "add ingredients first" over a recipe still loading.
  const ingredients = useLiveQuery(() => ingredientsRepo.all());

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
      setParts(recipeDraft(product.parts));
    })();
  }, [id]);

  if (existing === undefined || ingredients === undefined) return null;

  // Shown, not enforced: "עוגת פרחים" in two sizes may share a name on purpose.
  const sameName = findByName(products, name, existing?.id);

  async function save() {
    if (saving) return;
    const found = [...validateProduct({ name, price }), ...validateRecipe(parts)];
    setErrors(found);
    setSaveFailed(false);
    if (found.length > 0) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const recipe = recipeFromDraft(parts);
      await productsRepo.put(
        productFromDraft({ name, price, active, ...(recipe ? { parts: recipe } : {}) }, existing?.id ?? crypto.randomUUID(), now, existing ?? undefined),
      );
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

      <h3>{he.recipe.title}</h3>
      <p class="muted">{he.recipe.explain}</p>
      <RecipeEditor parts={parts} ingredients={ingredients} onChange={setParts} />
      <CostSummary parts={parts} ingredients={ingredients} price={parseShekels(price)} scaleUnits={scaleUnits} setScaleUnits={setScaleUnits} />

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
          {errors.map((e) => <li key={e}>{e === 'name' || e === 'price' ? he.products.errors[e] : he.recipe.errors[e]}</li>)}
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

/**
 * The cost of the recipe as typed so far, its margin, the two price marks and the recipe
 * scaled to a number of units (D36). Nothing here is stored. No recipe: nothing shown.
 */
function CostSummary({
  parts,
  ingredients,
  price,
  scaleUnits,
  setScaleUnits,
}: {
  parts: PartDraft[];
  ingredients: Ingredient[];
  price: number | null;
  scaleUnits: string;
  setScaleUnits: (text: string) => void;
}) {
  const recipe = draftAsRecipe(parts);
  const byId = ingredientMap(ingredients);
  const cost = productCost({ parts: recipe }, byId);
  if (cost === null) return null;

  const m = price !== null && price > 0 ? margin(price, cost) : null;
  const units = parseQuantity(scaleUnits);

  return (
    <>
      <dl class="facts">
        <dt>{he.recipe.cost}</dt>
        <dd><strong>{formatShekels(cost)}</strong></dd>
        <dt>{he.recipe.margin}</dt>
        <dd>{m ? `${formatShekels(m.amount)} · ${formatShare(m.share!)}` : he.recipe.noMargin}</dd>
        <dt>{he.recipe.minimumPrice}</dt>
        <dd>{formatShekels(priceForMargin(cost, minimumMargin))}</dd>
        <dt>{he.recipe.recommendedPrice}</dt>
        <dd>{formatShekels(priceForMargin(cost, recommendedMargin))}</dd>
      </dl>

      <details class="alert scaled">
        <summary>{he.recipe.scaleTitle}</summary>
        <label class="field">
          <span>{he.recipe.scaleUnits}</span>
          <input type="text" inputMode="decimal" value={scaleUnits} onFocus={selectAll} onInput={(e) => setScaleUnits(e.currentTarget.value)} />
        </label>
        {units !== null &&
          recipe.map((part, pi) =>
            part.lines.length === 0 ? null : (
              <div key={pi}>
                <h3>{part.name || '—'}</h3>
                <ul>
                  {part.lines.map((line, li) => {
                    const ingredient = byId.get(line.ingredientId)!;
                    return (
                      <li key={li}>
                        {ingredient.name}: {formatQty(scaleQty(line.qty, units))} {he.ingredients.units[ingredient.unit]}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ),
          )}
      </details>
    </>
  );
}
