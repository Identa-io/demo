export const DESTINATIONS = ['Europe', 'Worldwide excl. US/Canada', 'Worldwide'] as const;
export type Destination = (typeof DESTINATIONS)[number];

export const ADULT_PER_DAY = 4.2;
export const CHILD_PER_DAY = 2.1;
/** Knocked off the total when a current policy is shared through the file slot. */
export const SWITCH_DISCOUNT = 0.1;

const DESTINATION_FACTOR: Record<Destination, number> = {
  Europe: 1,
  'Worldwide excl. US/Canada': 1.4,
  Worldwide: 1.9,
};

export function isDestination(value: string | null | undefined): value is Destination {
  return !!value && (DESTINATIONS as readonly string[]).includes(value);
}

export interface TripPrice {
  adult: number;
  perChild: number;
  subtotal: number;
  discount: number;
  total: number;
}

/** One pricing function for the quote and the finish screen — the figures must never drift. */
export function tripPrice(args: {
  destination: Destination;
  days: number;
  childCount: number;
  switching: boolean;
}): TripPrice {
  const factor = DESTINATION_FACTOR[args.destination];
  const round = (v: number) => Math.round(v * 100) / 100;
  const adult = round(ADULT_PER_DAY * args.days * factor);
  const perChild = round(CHILD_PER_DAY * args.days * factor);
  const subtotal = round(adult + perChild * args.childCount);
  const discount = args.switching ? round(subtotal * SWITCH_DISCOUNT) : 0;
  return { adult, perChild, subtotal, discount, total: round(subtotal - discount) };
}
