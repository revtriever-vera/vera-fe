import { describe, expect, it } from 'vitest';
import { currentMonth, monthNeighbors, shiftMonth } from './month-navigation';

describe('currentMonth', () => {
    it('usa o ano e o mês da data com zero à esquerda', () => {
        expect(currentMonth(new Date(2026, 0, 31))).toBe('2026-01');
        expect(currentMonth(new Date(2026, 9, 11))).toBe('2026-10');
    });

    it('sem argumento usa o relógio', () => {
        expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/);
    });
});

describe('shiftMonth', () => {
    it('anda entre meses e atravessa o ano', () => {
        expect(shiftMonth('2026-09', 1)).toBe('2026-10');
        expect(shiftMonth('2026-01', -1)).toBe('2025-12');
        expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    });
});

describe('monthNeighbors', () => {
    it('o mês corrente não tem próximo e fica em andamento', () => {
        expect(monthNeighbors('2026-10', '2026-10')).toEqual({ previousMonth: '2026-09', nextMonth: null, isPartial: true });
    });

    it('um mês passado tem próximo', () => {
        expect(monthNeighbors('2026-08', '2026-10')).toEqual({ previousMonth: '2026-07', nextMonth: '2026-09', isPartial: false });
    });
});
