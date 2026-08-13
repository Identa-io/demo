export interface Listing {
  id: string;
  title: string;
  area: string;
  rent: number;
  size: number;
  rooms: number;
  art: string;
}

/** Editorial placeholders — calm gradients instead of stock photography in a public repo. */
export const LISTINGS: Listing[] = [
  { id: 'ornvagen-14', title: 'Örnvägen 14', area: 'Gamla Väster', rent: 1150, size: 62, rooms: 2, art: 'linear-gradient(160deg,#e8e2d6,#c8a272)' },
  { id: 'lindgatan-3', title: 'Lindgatan 3', area: 'Möllevången', rent: 890, size: 44, rooms: 1, art: 'linear-gradient(160deg,#dfe5e8,#5b7c99)' },
  { id: 'kajplats-21', title: 'Kajplats 21', area: 'Västra Hamnen', rent: 1490, size: 78, rooms: 3, art: 'linear-gradient(160deg,#e5e3de,#8a8f84)' },
];
