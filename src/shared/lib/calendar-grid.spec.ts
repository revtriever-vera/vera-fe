import { describe, expect, it } from 'vitest';
import {
    isoFromMasked,
    isoOf,
    isWithin,
    longDateOf,
    maskDate,
    maskedFromIso,
    monthGridOf,
    monthLabelOf,
    partsOf,
    shiftMonth,
    weekdayInitials,
    type CalendarDay
} from './calendar-grid';

describe('calendar-grid', () => {
    it('monta seis semanas sempre, para a grade não pular de altura ao virar o mês', () => {
        expect(monthGridOf({ year: 2026, month: 8 })).toHaveLength(42);
        expect(monthGridOf({ year: 2026, month: 1 })).toHaveLength(42);
    });

    it('começa a grade no domingo anterior ao dia 1', () => {
        const grid: CalendarDay[] = monthGridOf({ year: 2026, month: 8 });

        expect(grid[0]?.iso).toBe('2026-08-30');
        expect(grid[0]?.inMonth).toBe(false);
        expect(grid.find((cell: CalendarDay): boolean => cell.iso === '2026-09-01')?.inMonth).toBe(true);
    });

    it('nomeia o mês no locale ativo', () => {
        expect(monthLabelOf({ year: 2026, month: 8 }, 'pt-BR')).toBe('setembro de 2026');
        expect(monthLabelOf({ year: 2026, month: 8 }, 'en')).toBe('September 2026');
    });

    it('dá nome completo ao dia, porque a grade tem dois dias com o mesmo número', () => {
        expect(longDateOf('2026-09-10', 'pt-BR')).toBe('10 de setembro de 2026');
    });

    it('inicial do dia da semana começa no domingo, no locale ativo', () => {
        expect(weekdayInitials('pt-BR')).toEqual(['D', 'S', 'T', 'Q', 'Q', 'S', 'S']);
        expect(weekdayInitials('en')).toHaveLength(7);
    });

    it('anda de mês virando o ano', () => {
        expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
        expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    });

    it('mostra a data em dd/mm/aaaa e guarda em ISO', () => {
        expect(maskedFromIso('2026-09-08')).toBe('08/09/2026');
        expect(isoFromMasked('08/09/2026')).toBe('2026-09-08');
        expect(maskedFromIso(null)).toBe('');
    });

    it('põe as barras enquanto se digita e ignora o que não é dígito', () => {
        expect(maskDate('0')).toBe('0');
        expect(maskDate('0809')).toBe('08/09');
        expect(maskDate('08092026')).toBe('08/09/2026');
        expect(maskDate('08/09/2026999')).toBe('08/09/2026');
        expect(maskDate('ab08cd09')).toBe('08/09');
    });

    it('recusa data que não existe em vez de rolar para o mês seguinte', () => {
        expect(isoFromMasked('31/02/2026')).toBeNull();
        expect(isoFromMasked('08/13/2026')).toBeNull();
        expect(isoFromMasked('08/09/20')).toBeNull();
        expect(isoFromMasked('29/02/2024')).toBe('2024-02-29');
    });

    it('lê e escreve o dia sem escorregar de fuso', () => {
        expect(isoOf(2026, 8, 8)).toBe('2026-09-08');
        expect(partsOf('2026-09-08')).toEqual({ year: 2026, month: 8, day: 8 });
    });

    it('respeita os limites da janela', () => {
        expect(isWithin('2026-09-08', '2026-08-01', '2026-09-08')).toBe(true);
        expect(isWithin('2026-09-09', '2026-08-01', '2026-09-08')).toBe(false);
        expect(isWithin('2026-07-31', '2026-08-01', null)).toBe(false);
        expect(isWithin('2026-07-31', null, null)).toBe(true);
    });
});
