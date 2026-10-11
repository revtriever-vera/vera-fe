import { describe, expect, it } from 'vitest';
import { formatNumber } from './number';

describe('formatNumber', () => {
    it('formata com o separador de milhar de pt-BR', () => {
        expect(formatNumber(1234.5, 'pt-BR')).toBe('1.234,5');
    });

    it('formata com o separador de milhar de en', () => {
        expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    });
});
