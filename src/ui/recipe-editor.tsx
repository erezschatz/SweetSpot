import type { Ingredient } from '../db/schema';
import { he } from '../i18n/he';
import { draftAsRecipe, partCost, type PartDraft, type RecipeLineDraft } from '../lib/costing';
import { formatShekels } from '../lib/money';
import { href } from '../lib/route';
import { selectAll } from './inputs';

const emptyLine = (): RecipeLineDraft => ({ ingredientId: '', qty: '' });

/**
 * The recipe on the product form (D35): named parts, each a list of ingredient lines, added
 * and removed in place. Quantities are in each ingredient's own unit, for one unit of the product.
 */
export function RecipeEditor({
  parts,
  ingredients,
  onChange,
}: {
  parts: PartDraft[];
  ingredients: Ingredient[];
  onChange: (parts: PartDraft[]) => void;
}) {
  if (ingredients.length === 0) {
    return (
      <p class="message">
        {he.recipe.noIngredients}{' '}
        <a class="button secondary small" href={href({ name: 'ingredients' })}>{he.recipe.toIngredients}</a>
      </p>
    );
  }

  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const live = draftAsRecipe(parts);
  const setPart = (index: number, part: PartDraft) => onChange(parts.map((p, i) => (i === index ? part : p)));

  return (
    <>
      {parts.map((part, pi) => {
        const setLine = (li: number, line: RecipeLineDraft) =>
          setPart(pi, { ...part, lines: part.lines.map((l, i) => (i === li ? line : l)) });
        const cost = partCost(live[pi]!, byId);
        return (
          <div class="subform recipe-part" key={pi}>
            <label class="field">
              <span>{he.recipe.partName}</span>
              <input
                type="text"
                value={part.name}
                placeholder={he.recipe.partPlaceholder}
                onInput={(e) => setPart(pi, { ...part, name: e.currentTarget.value })}
              />
            </label>
            {part.lines.map((line, li) => {
              const unit = byId.get(line.ingredientId)?.unit;
              return (
                <div class="recipe-line" key={li}>
                  <select
                    value={line.ingredientId}
                    aria-label={he.recipe.chooseIngredient}
                    onChange={(e) => setLine(li, { ...line, ingredientId: e.currentTarget.value })}
                  >
                    <option value="">{he.recipe.chooseIngredient}</option>
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={line.qty}
                    aria-label={he.recipe.qty}
                    placeholder={he.recipe.qty}
                    onFocus={selectAll}
                    onInput={(e) => setLine(li, { ...line, qty: e.currentTarget.value })}
                  />
                  <span class="muted unit">{unit ? he.ingredients.units[unit] : ''}</span>
                  {/* A narrow ✕ leaves the ingredient's name room on a 360 px screen; the label is for TalkBack. */}
                  <button
                    type="button"
                    class="secondary small remove-line"
                    aria-label={he.recipe.removeLine}
                    onClick={() => setPart(pi, { ...part, lines: part.lines.filter((_, i) => i !== li) })}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            <div class="recipe-part-foot">
              <button type="button" class="secondary small" onClick={() => setPart(pi, { ...part, lines: [...part.lines, emptyLine()] })}>
                + {he.recipe.addLine}
              </button>
              <button type="button" class="secondary small" onClick={() => onChange(parts.filter((_, i) => i !== pi))}>
                {he.recipe.removePart}
              </button>
              {cost !== null && cost > 0 && (
                <span class="muted">
                  {he.recipe.partCost}: {formatShekels(cost)}
                </span>
              )}
            </div>
          </div>
        );
      })}
      <button type="button" class="secondary" onClick={() => onChange([...parts, { name: '', lines: [emptyLine()] }])}>
        + {he.recipe.addPart}
      </button>
    </>
  );
}
