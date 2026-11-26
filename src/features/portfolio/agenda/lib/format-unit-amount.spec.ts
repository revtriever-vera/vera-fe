import { describe, expect, it } from 'vitest';
import { formatUnitAmount } from './format-unit-amount';

describe('formatUnitAmount', () => {
    it('mantém as casas que o aviso trouxe', () => {
        expect(formatUnitAmount('0.78', 'BRL', 'en')).toBe('R$0.78');
        expect(formatUnitAmount('0.123456', 'BRL', 'en')).toBe('R$0.123456');
    });

    it('usa a moeda do dado', () => {
        expect(formatUnitAmount('1.5', 'USD', 'en')).toBe('$1.50');
    });
});
