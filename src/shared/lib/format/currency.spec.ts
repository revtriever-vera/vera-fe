import { describe, expect, it, vi } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
    it('formata reais com o separador de pt-BR', () => {
        expect(formatCurrency(123456, 'BRL', 'pt-BR')).toBe('R$ 1.234,56');
    });

    it('formata dólares com a pontuação brasileira', () => {
        expect(formatCurrency(123456, 'USD', 'pt-BR')).toBe('US$\u00a01.234,56');
    });

    it('formata pesos argentinos com o separador de pt-BR', () => {
        expect(formatCurrency(123456, 'ARS', 'pt-BR')).toBe('ARS 1.234,56');
    });

    it('formata dólares com o separador de en', () => {
        expect(formatCurrency(123456, 'USD', 'en')).toBe('$1,234.56');
    });

    it('não usa casas decimais para uma moeda sem centavos (CLP)', () => {
        expect(formatCurrency(1234, 'CLP', 'pt-BR')).toBe('CLP\u00a01.234');
    });

    it('nunca divide por 100 de forma fixa: usa o expoente do Intl para a moeda', () => {
        expect(formatCurrency(123456, 'ARS', 'pt-BR')).toBe('ARS 1.234,56');
        expect(formatCurrency(1234, 'CLP', 'pt-BR')).not.toContain(',');
    });

    it('cai para duas casas quando o Intl não informa o expoente', () => {
        vi.spyOn(Intl.NumberFormat.prototype, 'resolvedOptions').mockReturnValue({
            locale: 'pt-BR',
            numberingSystem: 'latn',
            style: 'currency',
            currency: 'BRL',
            currencyDisplay: 'symbol',
            currencySign: 'standard',
            minimumIntegerDigits: 1,
            useGrouping: true,
            notation: 'standard',
            signDisplay: 'auto',
            roundingIncrement: 1,
            roundingMode: 'halfExpand',
            roundingPriority: 'auto',
            trailingZeroDisplay: 'auto',
            maximumFractionDigits: undefined
        } as unknown as Intl.ResolvedNumberFormatOptions);

        expect(formatCurrency(123456, 'BRL', 'pt-BR')).toMatch(/R\$\s*1\.234,56/);

        vi.restoreAllMocks();
    });
});
