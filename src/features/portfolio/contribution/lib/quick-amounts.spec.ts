import { describe, expect, it } from 'vitest';
import { DEFAULT_AMOUNT, QUICK_AMOUNTS } from './quick-amounts';

describe('QUICK_AMOUNTS', () => {
    it('define os atalhos de cada moeda', () => {
        expect(QUICK_AMOUNTS.BRL).toEqual([5000, 10000, 25000, 50000]);
        expect(QUICK_AMOUNTS.USD).toEqual([1000, 2000, 5000, 10000]);
        expect(DEFAULT_AMOUNT).toBe(10000);
    });
});
