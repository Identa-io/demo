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
  { id: 'norden', name: 'Vinst Norden Index', isin: 'SE0011337700', strategy: 'Broad Nordic equity, market-cap weighted', fee: 0.19, fiveYear: 62.4, risk: 5 },
  { id: 'global', name: 'Vinst Global 70', isin: 'SE0011337718', strategy: '70/30 global equity and bonds', fee: 0.24, fiveYear: 48.1, risk: 4 },
  { id: 'ranta', name: 'Vinst Ränta Kort', isin: 'SE0011337726', strategy: 'Short-duration investment-grade credit', fee: 0.12, fiveYear: 9.6, risk: 2 },
];
