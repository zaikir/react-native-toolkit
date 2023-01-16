import type { Product } from './product';

export type Subscription = Product & {
  periodUnit: 'day' | 'week' | 'month' | 'year',
  numberOfPeriods: number,
  trial?: {
    periodUnit: 'day' | 'week' | 'month' | 'year',
    numberOfPeriods: number,
  },
};
