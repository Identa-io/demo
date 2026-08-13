'use client';

import { useEffect, useState } from 'react';
import { useDemoBase } from '@/lib/use-geena';
import { PRODUCTS, readCart, writeCart } from './products';

/**
 * Blomma — the no-account shop. The whole point is what is ABSENT: no login, no register, no
 * profile. You pick flowers; your details arrive at checkout, from your vault.
 */
export default function BlommaCatalog() {
  const base = useDemoBase('blomma');
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => setCart(readCart()), []);

  const add = (id: string) => {
    const next = { ...cart, [id]: (cart[id] ?? 0) + 1 };
    setCart(next);
    writeCart(next);
  };

  const count = Object.values(cart).reduce((sum, n) => sum + n, 0);

  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="py-10">
        <h1 className="font-display max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight">
          Fresh flowers, tied this morning.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[color:var(--muted)]">
          No account, no forms. Pick a bouquet — at checkout your details arrive from your Geena
          vault, and Blomma never stores them.
        </p>
      </section>

      <section className="grid gap-5 pb-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-3xl bg-[color:var(--card)] shadow-sm ring-1 ring-[color:var(--line)]"
          >
            <div
              className="flex h-40 items-center justify-center text-5xl"
              style={{ background: product.art }}
              aria-hidden
            >
              {product.emoji}
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">{product.name}</h2>
                <span className="text-[15px] font-semibold">€{product.price}</span>
              </div>
              <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">{product.note}</p>
              <button
                onClick={() => add(product.id)}
                className="mt-3 w-full rounded-full bg-[color:var(--accent)] px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Add to cart{cart[product.id] ? ` · ${cart[product.id]}` : ''}
              </button>
            </div>
          </article>
        ))}
      </section>

      {count > 0 && (
        <div className="sticky bottom-6 z-40 mx-auto flex max-w-md items-center justify-between gap-4 rounded-full bg-[color:var(--ink)] px-6 py-3 text-white shadow-xl">
          <span className="text-[13px]">
            {count} {count === 1 ? 'bouquet' : 'bouquets'} in your basket
          </span>
          <a
            href={`${base}/checkout`}
            className="rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold text-[color:var(--ink)]"
          >
            Check out →
          </a>
        </div>
      )}
    </main>
  );
}
