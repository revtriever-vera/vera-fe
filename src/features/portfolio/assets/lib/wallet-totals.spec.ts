import { describe, expect, it } from 'vitest';
import { holding, sampleHoldings, SAMPLE_TOTAL_MINOR } from '../../../../../test/fixtures/portfolio';
import { hasValue, walletTotals, type WalletTotals } from './wallet-totals';

describe('walletTotals', () => {
    it('soma só os ativos com valor e conta todos', () => {
        const totals: WalletTotals = walletTotals([
            holding({ id: 'a', valueMinor: 1000 }),
            holding({ id: 'b', valueMinor: 2500 }),
            holding({ id: 'c', valueMinor: 0, missingQuote: true }),
            holding({ id: 'd', valueMinor: 0, missingRate: true })
        ]);

        expect(totals).toEqual({ count: 4, totalMinor: 3500 });
    });

    it('carteira vazia vale zero', () => {
        expect(walletTotals([])).toEqual({ count: 0, totalMinor: 0 });
    });

    it('a carteira de exemplo tem 19 ativos e o total esperado', () => {
        expect(walletTotals(sampleHoldings().data)).toEqual({ count: 19, totalMinor: SAMPLE_TOTAL_MINOR });
    });

    it('hasValue olha cotação e câmbio', () => {
        expect(hasValue(holding())).toBe(true);
        expect(hasValue(holding({ missingQuote: true }))).toBe(false);
        expect(hasValue(holding({ missingRate: true }))).toBe(false);
    });
});
