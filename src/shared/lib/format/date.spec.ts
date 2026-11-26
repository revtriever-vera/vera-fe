import { describe, expect, it } from 'vitest';
import { formatClock, formatDate, formatDayMonthNumeric, formatIsoDate, formatMonthName, formatMonthYear, isSameLocalDay } from './date';

const SAME_INSTANT: Date = new Date('2026-01-15T14:30:00Z');

describe('formatDate', () => {
    it('usa o fuso do dado, não o do navegador: mesmo instante, horas diferentes', () => {
        const inSaoPaulo: string = formatDate(SAME_INSTANT, 'pt-BR', 'America/Sao_Paulo');
        const inMexicoCity: string = formatDate(SAME_INSTANT, 'pt-BR', 'America/Mexico_City');
        expect(inSaoPaulo).not.toBe(inMexicoCity);
    });

    it('o locale controla só o formato textual, com o mesmo fuso', () => {
        const inPortuguese: string = formatDate(SAME_INSTANT, 'pt-BR', 'America/Sao_Paulo');
        const inEnglish: string = formatDate(SAME_INSTANT, 'en', 'America/Sao_Paulo');
        expect(inPortuguese).toBe('15/01/2026, 11:30');
        expect(inEnglish).toBe('1/15/26, 11:30 AM');
    });
});

describe('formatIsoDate', () => {
    it('formata a data civil sem depender do fuso do navegador', () => {
        expect(formatIsoDate('2028-03-10', 'pt-BR')).toBe('10/03/2028');
        expect(formatIsoDate('2028-03-10', 'en')).toBe('03/10/2028');
        expect(formatIsoDate('2028-03-10T23:59:59Z', 'pt-BR')).toBe('10/03/2028');
    });
});

describe('formatMonthName', () => {
    it('escreve só o nome do mês, no idioma pedido', () => {
        expect(formatMonthName('2026-09', 'pt-BR')).toBe('setembro');
        expect(formatMonthName('2026-09', 'en')).toBe('September');
    });

    it('devolve o texto de entrada quando não é um mês', () => {
        expect(formatMonthName('hoje', 'pt-BR')).toBe('hoje');
    });
});

describe('formatMonthYear', () => {
    it('escreve mês e ano, no idioma pedido', () => {
        expect(formatMonthYear('2026-09', 'pt-BR')).toBe('setembro de 2026');
        expect(formatMonthYear('2026-09', 'en')).toBe('September 2026');
    });

    it('devolve o texto de entrada quando não é um mês', () => {
        expect(formatMonthYear('hoje', 'pt-BR')).toBe('hoje');
    });
});

describe('formatClock e formatDayMonthNumeric', () => {
    const moment: Date = new Date(2026, 9, 8, 8, 12);

    it('hora e minuto com dois dígitos', () => {
        expect(formatClock(moment, 'pt-BR')).toBe('08:12');
    });

    it('dia e mês numéricos', () => {
        expect(formatDayMonthNumeric(moment, 'pt-BR')).toBe('08/10');
    });
});

describe('isSameLocalDay', () => {
    it('compara o dia, ignorando a hora', () => {
        expect(isSameLocalDay(new Date(2026, 9, 8, 1), new Date(2026, 9, 8, 23))).toBe(true);
        expect(isSameLocalDay(new Date(2026, 9, 8, 23), new Date(2026, 9, 9, 1))).toBe(false);
    });
});
