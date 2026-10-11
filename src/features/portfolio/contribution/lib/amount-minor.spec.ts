import { describe, expect, it } from 'vitest';
import { amountToMinor, majorToMinor, minorToMajor } from './amount-minor';

describe('amountToMinor', () => {
    it.each(['10000', '10.000', '10.000,00'])('pt-BR: "%s" vale 10 mil', (text: string) => {
        expect(amountToMinor(text, 'BRL', 'pt-BR')).toBe(1000000);
    });

    it.each(['10000', '10,000', '10,000.00'])('en: "%s" vale 10 mil', (text: string) => {
        expect(amountToMinor(text, 'USD', 'en')).toBe(1000000);
    });

    it('lê os centavos e descarta o que passa de duas casas, para baixo', () => {
        expect(amountToMinor('1,5', 'BRL', 'pt-BR')).toBe(150);
        expect(amountToMinor('1,239', 'BRL', 'pt-BR')).toBe(123);
        expect(amountToMinor('0,01', 'BRL', 'pt-BR')).toBe(1);
    });

    it.each(['', '  ', 'abc', '-5', '0', '0,00', '0,009', '1,2,3', '9'.repeat(20)])('rejeita "%s"', (text: string) => {
        expect(amountToMinor(text, 'BRL', 'pt-BR')).toBeNull();
    });
});

describe('conversão entre unidade maior e menor', () => {
    it('vai e volta com duas casas', () => {
        expect(majorToMinor(25000.5, 'BRL', 'pt-BR')).toBe(2500050);
        expect(minorToMajor(2500050, 'BRL', 'pt-BR')).toBe(25000.5);
    });
});
