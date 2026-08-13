export interface Product {
  id: string;
  name: string;
  note: string;
  price: number;
  emoji: string;
  art: string;
}

/** No stock photos in a public repo — the bouquets are gradients with an honest emoji. */
export const PRODUCTS: Product[] = [
  { id: 'peony', name: 'Peony Morning', note: 'blush peonies, eucalyptus', price: 24, emoji: '🌸', art: 'linear-gradient(135deg,#f6d5d0,#e8b4b8)' },
  { id: 'forest', name: 'Forest Table', note: 'ferns, moss, white ranunculus', price: 32, emoji: '🌿', art: 'linear-gradient(135deg,#cfe3d3,#7ba98a)' },
  { id: 'citrus', name: 'Citrus Punch', note: 'marigold, dried orange', price: 19, emoji: '🍊', art: 'linear-gradient(135deg,#fbd9a0,#e9955c)' },
  { id: 'linen', name: 'Quiet Linen', note: 'white tulips, dusty miller', price: 28, emoji: '🤍', art: 'linear-gradient(135deg,#f3efe6,#d9d2c2)' },
  { id: 'meadow', name: 'Meadow Jar', note: 'wildflower mix of the week', price: 22, emoji: '🌼', art: 'linear-gradient(135deg,#f2e6b8,#c9d67e)' },
  { id: 'fir', name: 'Winter Fir', note: 'fir, thistle, red berries', price: 35, emoji: '🌲', art: 'linear-gradient(135deg,#bcd0c4,#476357)' },
];

const CART_KEY = 'blomma_cart';

export function readCart(): Record<string, number> {
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

export function writeCart(cart: Record<string, number>) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
