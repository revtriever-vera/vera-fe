import { describe, expect, it } from 'vitest';
import { formatMonth, formatMonthTitle, isMonth } from './format-month';

describe('formatMonth', () => {
    it('escreve o mês por extenso em pt-BR', () => {
        expect(formatMonth('2026-09', 'pt-BR')).toBe('setembro de 2026');
    });

    it('escreve o mês por extenso em en', () => {
        expect(formatMonth('2026-09', 'en')).toBe('September 2026');
    });

    it('não desloca o mês por causa do fuso', () => {
        expect(formatMonth('2026-01', 'pt-BR')).toBe('janeiro de 2026');
        expect(formatMonth('2026-12', 'en')).toBe('December 2026');
    });

    it('devolve o texto como veio quando não é um mês', () => {
        expect(formatMonth('abc', 'pt-BR')).toBe('abc');
    });
});

describe('formatMonthTitle', () => {
    it('põe a primeira letra em maiúscula conforme o idioma', () => {
        expect(formatMonthTitle('2026-09', 'pt-BR')).toBe('Setembro de 2026');
        expect(formatMonthTitle('2026-09', 'en')).toBe('September 2026');
    });
});

describe('isMonth', () => {
    it('aceita só AAAA-MM com mês de 01 a 12', () => {
        expect(isMonth('2026-09')).toBe(true);
        expect(isMonth('2026-13')).toBe(false);
        expect(isMonth('2026-00')).toBe(false);
        expect(isMonth('2026-9')).toBe(false);
        expect(isMonth('abc')).toBe(false);
    });
});
