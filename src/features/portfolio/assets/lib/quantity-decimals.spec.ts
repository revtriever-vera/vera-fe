import { describe, expect, it } from 'vitest';
import { decimalPlaces, fitsDecimals, isDecimalText, normalizeDecimalInput, quantityStep } from './quantity-decimals';

describe('quantity-decimals', () => {
    it('normaliza vírgula e espaços', () => {
        expect(normalizeDecimalInput(' 0,45 ')).toBe('0.45');
    });

    it('reconhece só números não negativos', () => {
        expect(isDecimalText('10')).toBe(true);
        expect(isDecimalText('10.5')).toBe(true);
        expect(isDecimalText('-1')).toBe(false);
        expect(isDecimalText('1e3')).toBe(false);
        expect(isDecimalText('')).toBe(false);
    });

    it('conta as casas decimais', () => {
        expect(decimalPlaces('2000')).toBe(0);
        expect(decimalPlaces('0.45')).toBe(2);
    });

    it('confere o limite do ativo', () => {
        expect(fitsDecimals('2000.5', 0)).toBe(false);
        expect(fitsDecimals('3.2', 2)).toBe(true);
        expect(fitsDecimals('3.205', 2)).toBe(false);
        expect(fitsDecimals('0.45', 8)).toBe(true);
    });

    it('sugere o passo pelo número de casas', () => {
        expect(quantityStep(0)).toBe('1');
        expect(quantityStep(2)).toBe('0.01');
        expect(quantityStep(8)).toBe('0.00000001');
    });
});
