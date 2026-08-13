export interface CarClass {
  id: string;
  name: string;
  example: string;
  perDay: number;
  seats: number;
  gearbox: 'Manual' | 'Automatic';
  drive: string;
  badge?: string;
}

/** Car classes, "or similar" — like every rental desk on earth. Figures illustrative. */
export const FLEET: CarClass[] = [
  { id: 'kompakt', name: 'Kompakt', example: 'VW Golf or similar', perDay: 39, seats: 5, gearbox: 'Manual', drive: 'Petrol · 5.1 l/100km' },
  { id: 'kombi', name: 'Kombi', example: 'Volvo V60 or similar', perDay: 62, seats: 5, gearbox: 'Automatic', drive: 'Hybrid · 4.4 l/100km', badge: 'Most booked' },
  { id: 'el', name: 'El', example: 'Polestar 2 or similar', perDay: 71, seats: 5, gearbox: 'Automatic', drive: 'Electric · 480 km range' },
];
