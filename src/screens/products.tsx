import { useLiveQuery } from 'dexie-react-hooks';
import type { Product } from '../db/schema';
import { productsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { formatShekels } from '../lib/money';
import { splitCatalogue } from '../lib/products';
import { href } from '../lib/route';

export function ProductsScreen() {
  const products = useLiveQuery(() => productsRepo.all());
  if (!products) return null;

  const { active, retired } = splitCatalogue(products);

  return (
    <section>
      <h2>{he.products.title}</h2>
      {products.length === 0 && <p class="muted">{he.products.empty}</p>}
      <ProductCards products={active} />

      {retired.length > 0 && (
        <>
          <h3>{he.products.retired}</h3>
          <ProductCards products={retired} />
        </>
      )}

      <a class="fab" href={href({ name: 'productNew' })}>+ {he.products.newProduct}</a>
    </section>
  );
}

function ProductCards({ products }: { products: Product[] }) {
  return (
    <ul class="cards">
      {products.map((p) => (
        <li key={p.id}>
          <a class={`card${p.active ? '' : ' retired'}`} href={href({ name: 'productEdit', id: p.id })}>
            <div class="card-top">
              <strong>{p.name}</strong>
              <span>{formatShekels(p.price)}</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
