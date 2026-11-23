import { describe, expect, it } from 'vitest';
import { addDays, daysInMonth, mondayFirstWeekday, mondayOf, monthOf, shortDate, weekdayLabels, weekdayShortDate } from './recurring-dates';

describe('recurring-dates', () => {
    it('acha a segunda-feira da semana, inclusive num domingo', () => {
        expect(mondayOf('2026-11-25')).toBe('2026-11-23');
        expect(mondayOf('2026-11-29')).toBe('2026-11-23');
        expect(mondayOf('2026-11-23')).toBe('2026-11-23');
    });

    it('soma dias atravessando o mês e o ano', () => {
        expect(addDays('2026-11-29', 3)).toBe('2026-12-02');
        expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    });

    it('conta os dias do mês, com fevereiro bissexto', () => {
        expect(daysInMonth('2026-11')).toBe(30);
        expect(daysInMonth('2028-02')).toBe(29);
    });

    it('dá o dia da semana começando na segunda', () => {
        expect(mondayFirstWeekday('2026-11-01')).toBe(6);
        expect(monthOf('2026-11-25')).toBe('2026-11');
    });

    it('formata a data curta e os rótulos da semana em pt-BR', () => {
        expect(shortDate('2026-11-25', 'pt-BR')).toBe('25/11');
        expect(weekdayShortDate('2026-11-25', 'pt-BR')).toContain('25/11');
        expect(weekdayLabels('pt-BR')).toHaveLength(7);
    });
});
