import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { civilDayZone } from '@/shared/lib/format/date';
import { formatDayMonth, periodMonthName } from '@/shared/lib/billing/billing-dates';
import { longDate, shortDate } from './billing-format';

const ORIGINAL_TZ: string | undefined = process.env['TZ'];

describe('datas sem hora no fuso do Brasil', () => {
    beforeAll((): void => {
        process.env['TZ'] = 'America/Sao_Paulo';
    });

    afterAll((): void => {
        if (ORIGINAL_TZ === undefined) {
            delete process.env['TZ'];
            return;
        }
        process.env['TZ'] = ORIGINAL_TZ;
    });

    it('mantém o dia da meia-noite UTC', () => {
        expect(longDate('2026-12-23T00:00:00.000Z', 'pt-BR')).toBe('23 de dezembro de 2026');
        expect(longDate('2027-01-07T00:00:00.000Z', 'en')).toBe('January 7, 2027');
        expect(shortDate('2027-03-07T00:00:00.000Z', 'pt-BR')).toBe('07/03/2027');
        expect(longDate('2027-03-07', 'pt-BR')).toBe('7 de março de 2027');
    });

    it('instantes com hora seguem o fuso do navegador', () => {
        expect(longDate('2026-12-23T03:00:00.000Z', 'pt-BR')).toBe('23 de dezembro de 2026');
        expect(longDate('2026-12-23T01:00:00.000Z', 'pt-BR')).toBe('22 de dezembro de 2026');
    });

    it('o dia do mês e o mês do período também não voltam um dia', () => {
        expect(formatDayMonth('2026-12-01T00:00:00.000Z', 'pt-BR')).toBe('1º de dezembro');
        expect(periodMonthName('2026-12-01T00:00:00.000Z', 'pt-BR')).toBe('novembro');
    });

    it('só trata como dia civil o que é meia-noite UTC ou data pura', () => {
        expect(civilDayZone('2026-12-23T00:00:00Z')).toBe('UTC');
        expect(civilDayZone('2026-12-23')).toBe('UTC');
        expect(civilDayZone('2026-12-23T00:00:01.000Z')).toBeUndefined();
    });
});
