import { describe, expect, it } from 'vitest';
import { formatUnitPrice } from './format-unit-price';

describe('formatUnitPrice', () => {
    it('usa a moeda e o idioma do dado', () => {
        expect(formatUnitPrice('37.80', 'BRL', 'pt-BR')).toBe('R$\u00a037,80');
        expect(formatUnitPrice('545', 'USD', 'en')).toBe('$545.00');
    });

    it('mantém as casas de preços pequenos até o limite', () => {
        expect(formatUnitPrice('0.00001234', 'USD', 'en')).toBe('$0.00001234');
        expect(formatUnitPrice('1.123456789', 'USD', 'en')).toBe('$1.12345679');
    });
});
