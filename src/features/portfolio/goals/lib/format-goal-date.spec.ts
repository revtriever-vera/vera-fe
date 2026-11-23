import { describe, expect, it } from 'vitest';
import { formatGoalMonth } from './format-goal-date';

describe('formatGoalMonth', () => {
    it('escreve mês e ano no idioma, sem deslocar pelo fuso', () => {
        expect(formatGoalMonth('2027-06-15', 'pt-BR')).toBe('junho de 2027');
        expect(formatGoalMonth('2027-06-01', 'en')).toBe('June 2027');
        expect(formatGoalMonth('2027-01-31', 'pt-BR')).toBe('janeiro de 2027');
    });
});
