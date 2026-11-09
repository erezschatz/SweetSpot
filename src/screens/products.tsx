import { useLiveQuery } from 'dexie-react-hooks';
import type { Product } from '../db/schema';
import { ingredientsRepo, productsRepo } from '../db/repositories';
import { ingredientMap, productCost } from '../lib/costing';
import { he } from '../i18n/he';
import { formatShekels } from '../lib/money';
import { splitCatalogue } from '../lib/products';
import { href } from '../lib/route';

export function ProductsScreen() {
  const products = useLiveQuery(() => productsRepo.all());
  const ingredients = useLiveQuery(() => ingredientsRepo.all());
  if (!products || !ingredients) return null;

  const { active, retired } = splitCatalogue(products);
  const prices = ingredientMap(ingredients);
  const costOf = (p: Product) => productCost(p, prices);

  return (
    <section>
      <h2>{he.products.title}</h2>
      <p>
        <a href={href({ name: 'ingredients' })}>{he.products.ingredientsLink}</a>
      </p>
      {products.length === 0 && <p class="muted">{he.products.empty}</p>}
      <ProductCards products={active} costOf={costOf} />

      {retired.length > 0 && (
        <>
          <h3>{he.products.retired}</h3>
          <ProductCards products={retired} costOf={costOf} />
        </>
      )}

      <a class="fab" href={href({ name: 'productNew' })}>+ {he.products.newProduct}</a>
    </section>
  );
}

function ProductCards({ products, costOf }: { products: Product[]; costOf: (p: Product) => number | null }) {
  return (
    <ul class="cards">
      {products.map((p) => (
        <li key={p.id}>
          <a class={`card${p.active ? '' : ' retired'}`} href={href({ name: 'productEdit', id: p.id })}>
            <div class="card-top">
              <strong>{p.name}</strong>
              <span>{formatShekels(p.price)}</span>
            </div>
            {costOf(p) !== null && (
              <p class="card-line muted">
                {he.products.cost} {formatShekels(costOf(p)!)} · {he.products.margin} {formatShekels(p.price - costOf(p)!)}
              </p>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
