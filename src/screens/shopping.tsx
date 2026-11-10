import { useLiveQuery } from 'dexie-react-hooks';
import { ingredientsRepo, ordersRepo, productsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { formatQty } from '../lib/costing';
import { formatDay, localIsoDate } from '../lib/dates';
import { href } from '../lib/route';
import { shoppingList } from '../lib/shopping';

// D36: a glance before shopping. Derived from the current recipes each time; nothing is ticked.
export function ShoppingScreen() {
  const orders = useLiveQuery(() => ordersRepo.all());
  const products = useLiveQuery(() => productsRepo.all());
  const ingredients = useLiveQuery(() => ingredientsRepo.all());
  if (!orders || !products || !ingredients) return null;

  const list = shoppingList(orders, products, ingredients, localIsoDate(new Date()));

  return (
    <section>
      <h2>{he.shopping.title}</h2>
      <div class="screen-links">
        <a class="button secondary" href={href({ name: 'ingredients' })}>→ {he.ingredients.title}</a>
      </div>
      <p class="muted">
        {he.shopping.explain} {formatDay(list.until)} · {list.orderCount} {he.shopping.orders}
      </p>

      {list.orderCount === 0 && <p class="muted">{he.shopping.nothing}</p>}
      {list.orderCount > 0 && list.lines.length === 0 && <p class="muted">{he.shopping.nothingCovered}</p>}

      <ul class="cards">
        {list.lines.map((l) => (
          <li key={l.ingredient.id} class="card">
            <div class="card-top">
              <strong>{l.ingredient.name}</strong>
              <span>
                {formatQty(l.qty)} {he.ingredients.units[l.ingredient.unit]}
              </span>
            </div>
            <p class="card-line muted">
              {l.packs} {l.packs === 1 ? he.shopping.pack : he.shopping.packs} × {formatQty(l.ingredient.packQty)} {he.ingredients.units[l.ingredient.unit]}
            </p>
          </li>
        ))}
      </ul>

      {list.notCovered.length > 0 && (
        <>
          <h3>{he.shopping.notCovered}</h3>
          <ul>
            {list.notCovered.map((n) => (
              <li key={n.name}>
                {n.qty > 1 && `${n.qty} × `}
                {n.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
