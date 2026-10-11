import { describe, expect, it } from 'vitest';
import { barScale, widthPercent } from './bar-scale';

describe('barScale', () => {
    it('usa o maior gasto', () => {
        expect(
            barScale(
                [
                    { spentMinor: 500, averageMinor: 400 },
                    { spentMinor: 900, averageMinor: 800 }
                ],
                0
            )
        ).toBe(900);
    });

    it('a média maior que o gasto entra na escala', () => {
        expect(barScale([{ spentMinor: 500, averageMinor: 1200 }], 300)).toBe(1200);
    });

    it('a linha sem categoria também entra', () => {
        expect(barScale([{ spentMinor: 500, averageMinor: null }], 800)).toBe(800);
    });

    it('sem linhas a escala é zero', () => {
        expect(barScale([], 0)).toBe(0);
        expect(barScale([], -50)).toBe(0);
    });
});

describe('widthPercent', () => {
    it('calcula a proporção da escala', () => {
        expect(widthPercent(250, 1000)).toBe(25);
        expect(widthPercent(1000, 1000)).toBe(100);
    });

    it('valor negativo vira largura 0', () => {
        expect(widthPercent(-300, 1000)).toBe(0);
    });

    it('escala zero devolve 0', () => {
        expect(widthPercent(100, 0)).toBe(0);
    });

    it('nunca passa de 100', () => {
        expect(widthPercent(2000, 1000)).toBe(100);
    });
});
