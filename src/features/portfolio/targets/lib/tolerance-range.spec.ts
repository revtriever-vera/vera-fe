import { describe, expect, it } from 'vitest';
import { toleranceRange } from './tolerance-range';

describe('toleranceRange', () => {
    it('abre a faixa em volta da meta', () => {
        expect(toleranceRange(2000, 500)).toEqual({ lowerBps: 1500, upperBps: 2500 });
    });

    it('limita o piso em 0', () => {
        expect(toleranceRange(300, 500)).toEqual({ lowerBps: 0, upperBps: 800 });
    });

    it('limita o teto em 100%', () => {
        expect(toleranceRange(9800, 500)).toEqual({ lowerBps: 9300, upperBps: 10000 });
    });
});
