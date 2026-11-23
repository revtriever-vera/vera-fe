import { describe, expect, it } from 'vitest';
import { formatDayMonth, periodMonthName, usedPercent } from './billing-dates';

describe('billing dates', () => {
    it('writes the first day with the ordinal in Portuguese', () => {
        expect(formatDayMonth('2026-11-01T12:00:00.000Z', 'pt-BR')).toBe('1º de novembro');
    });

    it('keeps the plain number on the other days', () => {
        expect(formatDayMonth('2026-11-15T12:00:00.000Z', 'pt-BR')).toBe('15 de novembro');
    });

    it('does not touch the English format', () => {
        expect(formatDayMonth('2026-11-01T12:00:00.000Z', 'en')).toBe('November 1');
    });

    it('names the month that ends at the reset', () => {
        expect(periodMonthName('2026-11-01T03:00:00.000Z', 'pt-BR')).toBe('outubro');
    });

    it('turns basis points into a capped whole percent', () => {
        expect(usedPercent(3450)).toBe(34);
        expect(usedPercent(12000)).toBe(100);
    });
});
