import { describe, expect, it } from 'vitest';
import { parseRateBps } from './rate-input';

describe('parseRateBps', () => {
    it.each([
        ['110', 11000],
        ['12,5', 1250],
        ['12.25', 1225],
        ['0', 0],
        ['300', 30000]
    ])('lê %s como %d pontos-base', (text: string, expected: number) => {
        expect(parseRateBps(text)).toBe(expected);
    });

    it('recusa texto inválido', () => {
        expect(parseRateBps('')).toBeNull();
        expect(parseRateBps('abc')).toBeNull();
        expect(parseRateBps('1,234')).toBeNull();
        expect(parseRateBps('-5')).toBeNull();
    });
});
