import { describe, expect, it } from 'vitest';
import { formatGoalMonth, formatMonthName } from './format-goal-date';

describe('formatGoalMonth', () => {
    it('escreve mês e ano no idioma, sem deslocar pelo fuso', () => {
        expect(formatGoalMonth('2027-06-15', 'pt-BR')).toBe('junho de 2027');
        expect(formatGoalMonth('2027-06-01', 'en')).toBe('June 2027');
        expect(formatGoalMonth('2027-01-31', 'pt-BR')).toBe('janeiro de 2027');
    });
});

describe('formatMonthName', () => {
    it('escreve só o mês, no idioma pedido', () => {
        expect(formatMonthName('2026-08', 'pt-BR')).toBe('agosto');
        expect(formatMonthName('2026-10', 'en')).toBe('October');
    });
});
