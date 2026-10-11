import { describe, expect, it } from 'vitest';
import { currencySymbol, formatMoneyText, fractionDigitsOf, parseMoneyText, sanitizeMoneyText } from './money-input';

describe('parseMoneyText', () => {
    it.each([
        ['50000', 5000000],
        ['50.000,00', 5000000],
        ['50,000.00', 5000000],
        ['1234,5', 123450],
        ['0,07', 7],
        ['12.5', 1250],
        ['50.000', 5000000],
        ['007', 700]
    ])('lê %s como %d unidades menores', (text: string, expected: number) => {
        expect(parseMoneyText(text, 2)).toBe(expected);
    });

    it('devolve nulo para vazio, sem dígitos ou grande demais', () => {
        expect(parseMoneyText('', 2)).toBeNull();
        expect(parseMoneyText(',', 2)).toBeNull();
        expect(parseMoneyText('9999999999999999', 2)).toBeNull();
    });

    it('respeita moedas sem casas decimais', () => {
        expect(parseMoneyText('1.500', 0)).toBe(1500);
    });
});

describe('formatação do campo', () => {
    it('formata sem o símbolo, com o locale', () => {
        expect(formatMoneyText(5000000, 2, 'pt-BR')).toBe('50.000,00');
        expect(formatMoneyText(5000000, 2, 'en')).toBe('50,000.00');
    });

    it('descobre símbolo e casas da moeda', () => {
        expect(currencySymbol('BRL', 'pt-BR')).toBe('R$');
        expect(currencySymbol('USD', 'en')).toBe('$');
        expect(fractionDigitsOf('BRL', 'pt-BR')).toBe(2);
        expect(fractionDigitsOf('JPY', 'en')).toBe(0);
    });

    it('descarta caracteres que não são de dinheiro', () => {
        expect(sanitizeMoneyText('R$ 1a2,3')).toBe('12,3');
    });
});
