import { describe, expect, it } from 'vitest';
import { bpsToInput, parsePercentInput } from './parse-percent-input';

describe('parsePercentInput', () => {
    it.each([
        ['20', 2000],
        ['12,5', 1250],
        ['12.5', 1250],
        ['33,33', 3333],
        ['0', 0],
        ['100', 10000],
        ['100,00', 10000],
        [' 7 ', 700],
        ['5,05', 505]
    ])('converte %s em %i bps', (text: string, bps: number) => {
        expect(parsePercentInput(text, 'pt-BR')).toBe(bps);
    });

    it.each(['100,01', '-1', 'abc', '', '12,345', '1.000,5', '101', '1,', ',5'])('rejeita %j', (text: string) => {
        expect(parsePercentInput(text, 'pt-BR')).toBeNull();
    });
});

describe('bpsToInput', () => {
    it('devolve o texto editável sem separador de milhar', () => {
        expect(bpsToInput(1250, 'pt-BR')).toBe('12,5');
        expect(bpsToInput(1250, 'en')).toBe('12.5');
        expect(bpsToInput(10000, 'pt-BR')).toBe('100');
    });

    it('ida e volta preserva o valor', () => {
        expect(parsePercentInput(bpsToInput(3333, 'pt-BR'), 'pt-BR')).toBe(3333);
    });
});
