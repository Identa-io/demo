export interface Fund {
  id: string;
  name: string;
  isin: string;
  strategy: string;
  fee: number;
  fiveYear: number;
  risk: number;
}

/** Model funds — figures are illustrative, like everything else on this fictional platform. */
export const FUNDS: Fund[] = [
  {
    id: 'global',
    name: 'Yield Global Index',
    isin: 'IE00YLD10017',
    strategy: 'Developed-world equity, market-cap weighted',
    fee: 0.18,
    fiveYear: 58.2,
    risk: 5,
  },
  {
    id: 'europe',
    name: 'Yield Europe 70',
    isin: 'LU00YLD20025',
    strategy: '70/30 European equity and bonds',
    fee: 0.15,
    fiveYear: 41.7,
    risk: 4,
  },
  {
    id: 'short',
    name: 'Yield Short Duration',
    isin: 'LU00YLD30033',
    strategy: 'Short-dated investment-grade credit',
    fee: 0.1,
    fiveYear: 8.9,
    risk: 2,
  },
];
