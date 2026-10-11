import { describe, expect, it } from 'vitest';
import { defaultRateText, indexerClassKey, localTodayIso, rateLabelKey, RATE_RANGE_BPS } from './fixed-income-defaults';

describe('fixed-income-defaults', () => {
    it('sugere a taxa por indexador no formato do idioma', () => {
        expect(defaultRateText('cdi_percent', 'pt-BR')).toBe('105');
        expect(defaultRateText('prefixed', 'pt-BR')).toBe('12,5');
        expect(defaultRateText('ipca_plus', 'pt-BR')).toBe('6,2');
        expect(defaultRateText('prefixed', 'en')).toBe('12.5');
    });

    it('troca o rótulo da taxa por indexador', () => {
        expect(rateLabelKey('cdi_percent')).toBe('fixedIncome.rate.cdi_percent');
        expect(rateLabelKey('prefixed')).toBe('fixedIncome.rate.prefixed');
        expect(rateLabelKey('ipca_plus')).toBe('fixedIncome.rate.ipca_plus');
    });

    it('escolhe a classe pelo indexador', () => {
        expect(indexerClassKey('cdi_percent')).toBe('rf_pos');
        expect(indexerClassKey('prefixed')).toBe('rf_pre');
        expect(indexerClassKey('ipca_plus')).toBe('rf_ipca');
    });

    it('espelha os intervalos de taxa da API', () => {
        expect(RATE_RANGE_BPS.cdi_percent).toEqual({ min: 1, max: 30000 });
        expect(RATE_RANGE_BPS.prefixed.max).toBe(10000);
        expect(RATE_RANGE_BPS.ipca_plus.max).toBe(5000);
    });

    it('formata a data local de hoje em ISO', () => {
        expect(localTodayIso(new Date(2026, 9, 5))).toBe('2026-10-05');
    });
});
