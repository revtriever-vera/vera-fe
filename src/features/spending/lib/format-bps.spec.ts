import { describe, expect, it } from 'vitest';
import { formatDeltaBps, formatRateBps, toMajorUnits } from './format-bps';

describe('formatDeltaBps', () => {
    it('mostra o aumento com sinal e sem casas decimais', () => {
        expect(formatDeltaBps(4000, 'pt-BR')).toBe('+40%');
        expect(formatDeltaBps(3571, 'pt-BR')).toBe('+36%');
        expect(formatDeltaBps(4688, 'pt-BR')).toBe('+47%');
    });

    it('troca o hífen pelo sinal de menos tipográfico', () => {
        expect(formatDeltaBps(-500, 'pt-BR')).toBe('−5%');
    });

    it('não põe sinal no zero', () => {
        expect(formatDeltaBps(0, 'pt-BR')).toBe('0%');
    });

    it('segue o idioma', () => {
        expect(formatDeltaBps(4000, 'en')).toBe('+40%');
        expect(formatDeltaBps(-500, 'en')).toBe('−5%');
    });
});

describe('formatRateBps', () => {
    it('mostra a taxa sem casas decimais e sem sinal de mais', () => {
        expect(formatRateBps(1200, 'pt-BR')).toBe('12%');
        expect(formatRateBps(1200, 'en')).toBe('12%');
    });

    it('mostra a taxa negativa com o sinal de menos tipográfico', () => {
        expect(formatRateBps(-300, 'pt-BR')).toBe('−3%');
    });
});

describe('toMajorUnits', () => {
    it('converte pelo expoente da moeda', () => {
        expect(toMajorUnits(224000, 'BRL')).toBe(2240);
        expect(toMajorUnits(1050, 'USD')).toBe(10.5);
    });

    it('respeita moedas sem casas decimais', () => {
        expect(toMajorUnits(500, 'JPY')).toBe(500);
    });
});
