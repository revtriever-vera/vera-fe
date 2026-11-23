import { describe, expect, it } from 'vitest';
import { progressPercent, signedDelta } from './goal-progress';

describe('progressPercent', () => {
    it('arredonda para baixo e limita a 0 e 100', () => {
        expect(progressPercent(2232000, 3120000)).toBe(71);
        expect(progressPercent(5000000, 3120000)).toBe(100);
        expect(progressPercent(-10, 3120000)).toBe(0);
    });

    it('não divide por zero', () => {
        expect(progressPercent(100, 0)).toBe(0);
    });
});

describe('signedDelta', () => {
    it('separa ganho, perda e ausência de variação', () => {
        expect(signedDelta(38000)).toEqual({ sign: 'gain', absMinor: 38000 });
        expect(signedDelta(-42000)).toEqual({ sign: 'loss', absMinor: 42000 });
        expect(signedDelta(0)).toBeNull();
    });
});
