import { describe, expect, it } from 'vitest';
import { equalSplitBps } from './equal-split';

describe('equalSplitBps', () => {
    it('divide 3 ativos com o resto no primeiro', () => {
        expect(equalSplitBps(3)).toEqual([3334, 3333, 3333]);
    });

    it('1 ativo recebe tudo', () => {
        expect(equalSplitBps(1)).toEqual([10000]);
    });

    it('divisão exata não deixa resto', () => {
        expect(equalSplitBps(4)).toEqual([2500, 2500, 2500, 2500]);
    });

    it('sem ativos devolve lista vazia', () => {
        expect(equalSplitBps(0)).toEqual([]);
    });

    it('distribui o resto aos primeiros e sempre soma 10000', () => {
        const split: readonly number[] = equalSplitBps(7);
        expect(split.reduce((sum: number, value: number): number => sum + value, 0)).toBe(10000);
        expect(split).toEqual([1429, 1429, 1429, 1429, 1428, 1428, 1428]);
    });
});
