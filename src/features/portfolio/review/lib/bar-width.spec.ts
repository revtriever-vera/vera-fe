import { describe, expect, it } from 'vitest';
import { barWidth, maxMagnitude } from './bar-width';

describe('barWidth', () => {
    it('a maior magnitude ocupa a barra toda, queda ou alta', () => {
        expect(barWidth(-4, 4)).toBe('100.0%');
        expect(barWidth(2, 4)).toBe('50.0%');
    });

    it('valor minúsculo ou escala zerada ainda desenha um filete', () => {
        expect(barWidth(0.001, 4)).toBe('2.0%');
        expect(barWidth(1, 0)).toBe('2%');
    });
});

describe('maxMagnitude', () => {
    it('ignora o que não tem valor e olha o módulo', () => {
        expect(maxMagnitude([1, null, -3])).toBe(3);
        expect(maxMagnitude([])).toBe(0);
    });
});
