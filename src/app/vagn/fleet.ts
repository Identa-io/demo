export interface CarClass {
  id: string;
  name: string;
  example: string;
  perDay: number;
  seats: number;
  gearbox: 'Manual' | 'Automatic';
  drive: string;
  /** The booking reference, set as a registration plate — Vagn's signature mark. */
  plate: string;
  badge?: string;
}

/** Car classes, "or similar" — like every rental desk on earth. Figures illustrative. */
export const FLEET: CarClass[] = [
  {
    id: 'kompakt',
    name: 'Kompakt',
    example: 'VW Golf or similar',
    perDay: 39,
    seats: 5,
    gearbox: 'Manual',
    drive: 'Petrol · 5.1 l/100km',
    plate: 'KPT 214',
  },
  {
    id: 'kombi',
    name: 'Kombi',
    example: 'Volvo V60 or similar',
    perDay: 62,
    seats: 5,
    gearbox: 'Automatic',
    drive: 'Hybrid · 4.4 l/100km',
    plate: 'KMB 507',
    badge: 'Most booked',
  },
  {
    id: 'el',
    name: 'El',
    example: 'Polestar 2 or similar',
    perDay: 71,
    seats: 5,
    gearbox: 'Automatic',
    drive: 'Electric · 480 km range',
    plate: 'ELV 093',
  },
];
