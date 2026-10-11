import { describe, expect, it } from 'vitest';
import { HIGHLIGHT_DELTA_BPS, shouldHighlight } from './delta-highlight';

describe('shouldHighlight', () => {
    it('não destaca 999', () => {
        expect(shouldHighlight({ deltaBps: 999 })).toBe(false);
    });

    it('destaca 1000', () => {
        expect(HIGHLIGHT_DELTA_BPS).toBe(1000);
        expect(shouldHighlight({ deltaBps: 1000 })).toBe(true);
    });

    it('destaca acima do limite', () => {
        expect(shouldHighlight({ deltaBps: 4700 })).toBe(true);
    });

    it('não destaca nulo nem queda', () => {
        expect(shouldHighlight({ deltaBps: null })).toBe(false);
        expect(shouldHighlight({ deltaBps: -2500 })).toBe(false);
    });
});
