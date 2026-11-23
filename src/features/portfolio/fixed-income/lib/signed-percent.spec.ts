import { describe, expect, it } from 'vitest';
import { formatSignedPercentBps, signSymbol } from './signed-percent';

describe('signed percent', () => {
    it('usa o sinal de menos tipográfico', () => {
        expect(signSymbol(-1)).toBe('−');
        expect(signSymbol(0)).toBe('+');
        expect(formatSignedPercentBps(-250, 'pt-BR')).toBe('−2,5%');
        expect(formatSignedPercentBps(769, 'pt-BR')).toBe('+7,69%');
    });
});
