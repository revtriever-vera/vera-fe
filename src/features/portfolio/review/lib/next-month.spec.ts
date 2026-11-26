import { describe, expect, it } from 'vitest';
import { nextMonth } from './next-month';

describe('nextMonth', () => {
    it('avança um mês', () => {
        expect(nextMonth('2026-10')).toBe('2026-11');
        expect(nextMonth('2026-01')).toBe('2026-02');
    });

    it('vira o ano em dezembro', () => {
        expect(nextMonth('2026-12')).toBe('2027-01');
    });

    it('devolve o texto de entrada quando não é um mês', () => {
        expect(nextMonth('hoje')).toBe('hoje');
    });
});
