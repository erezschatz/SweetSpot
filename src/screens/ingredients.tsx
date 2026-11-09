import { useLiveQuery } from 'dexie-react-hooks';
import { ingredientsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { displayUnitCost, formatQty } from '../lib/costing';
import { formatShekels } from '../lib/money';
import { href } from '../lib/route';

// Step 09: what she buys, once each, reached from the products screen (D35).
export function IngredientsScreen() {
  const ingredients = useLiveQuery(() => ingredientsRepo.all());
  if (!ingredients) return null;

  return (
    <section>
      <h2>{he.ingredients.title}</h2>
      <p>
        <a href={href({ name: 'products' })}>→ {he.ingredients.backToProducts}</a>
        {ingredients.length > 0 && (
          <>
            {' · '}
            <a href={href({ name: 'shopping' })}>{he.ingredients.toShopping}</a>
          </>
        )}
      </p>
      {ingredients.length === 0 && <p class="muted">{he.ingredients.empty}</p>}
      <ul class="cards">
        {ingredients.map((i) => (
          <li key={i.id}>
            <a class="card" href={href({ name: 'ingredientEdit', id: i.id })}>
              <div class="card-top">
                <strong>{i.name}</strong>
                <span>
                  {formatShekels(displayUnitCost(i))} {he.ingredients.perUnit[i.unit]}
                </span>
              </div>
              <p class="card-line muted">
                {formatQty(i.packQty)} {he.ingredients.units[i.unit]} · {formatShekels(i.packPrice)}
              </p>
            </a>
          </li>
        ))}
      </ul>

      <a class="fab" href={href({ name: 'ingredientNew' })}>+ {he.ingredients.newIngredient}</a>
    </section>
  );
}
