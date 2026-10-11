import { describe, expect, it } from 'vitest';
import { segmentWidths } from './segment-widths';

const SAMPLE_SHARES: readonly number[] = [2082, 1161, 728, 1242, 656, 2091, 869, 1171];

describe('segmentWidths', () => {
    it('converte os pontos-base em percentuais que somam 100 exatos', () => {
        const widths: readonly number[] = segmentWidths(SAMPLE_SHARES);

        expect(widths[0]).toBe(20.82);
        expect(widths.reduce((sum: number, value: number): number => sum + value, 0)).toBeCloseTo(100, 10);
    });

    it('o último segmento absorve o excesso do arredondamento', () => {
        const widths: readonly number[] = segmentWidths([3334, 3334, 3334]);

        expect(widths).toEqual([33.34, 33.34, 33.32]);
    });

    it('nunca estoura a barra mesmo com sobra grande', () => {
        const widths: readonly number[] = segmentWidths([9000, 2000, 500]);

        expect(widths).toEqual([90, 10, 0]);
    });

    it('uma carteira vazia devolve zeros', () => {
        expect(segmentWidths([0, 0, 0])).toEqual([0, 0, 0]);
        expect(segmentWidths([])).toEqual([]);
    });

    it('descarta valores negativos', () => {
        expect(segmentWidths([-50, 100])).toEqual([0, 1]);
    });
});
