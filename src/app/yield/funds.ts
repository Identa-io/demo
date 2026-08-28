export interface Fund {
  id: string;
  name: string;
  strategy: string;
  fee: number;
  fiveYear: number;
}

/** Model funds — figures are illustrative, like everything else on this fictional platform. */
export const FUNDS: Fund[] = [
  {
    id: 'global',
    name: 'Yield Global Index',
    strategy: 'Developed-world equity',
    fee: 0.18,
    fiveYear: 58.2,
  },
  {
    id: 'europe',
    name: 'Yield Europe 70',
    strategy: '70/30 equity and bonds',
    fee: 0.15,
    fiveYear: 41.7,
  },
  {
    id: 'short',
    name: 'Yield Short Duration',
    strategy: 'Short-dated credit',
    fee: 0.1,
    fiveYear: 8.9,
  },
];
