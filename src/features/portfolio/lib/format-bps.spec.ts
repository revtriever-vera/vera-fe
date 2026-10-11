import { describe, expect, it } from 'vitest';
import { formatPpBps, formatShareBps, formatTargetBps } from './format-bps';

describe('formatShareBps', () => {
    it('formata em pt-BR com uma casa', () => {
        expect(formatShareBps(2082, 'pt-BR')).toBe('20,8%');
    });

    it('formata em en com uma casa', () => {
        expect(formatShareBps(2082, 'en')).toBe('20.8%');
    });

    it('aceita outro número de casas', () => {
        expect(formatShareBps(2082, 'pt-BR', 2)).toBe('20,82%');
        expect(formatShareBps(2000, 'pt-BR', 0)).toBe('20%');
    });
});

describe('formatTargetBps', () => {
    it('mostra inteiro quando possível', () => {
        expect(formatTargetBps(2000, 'pt-BR')).toBe('20%');
        expect(formatTargetBps(2000, 'en')).toBe('20%');
    });

    it('mostra casas só quando existem', () => {
        expect(formatTargetBps(1250, 'pt-BR')).toBe('12,5%');
        expect(formatTargetBps(3333, 'en')).toBe('33.33%');
    });
});

describe('formatPpBps', () => {
    it('mostra o sinal de mais no desvio positivo', () => {
        expect(formatPpBps(361, 'pt-BR')).toBe('+3,6 pp');
        expect(formatPpBps(361, 'en')).toBe('+3.6 pp');
    });

    it('usa o sinal de menos tipográfico no desvio negativo', () => {
        expect(formatPpBps(-472, 'pt-BR')).toBe('−4,7 pp');
        expect(formatPpBps(-472, 'en')).toBe('−4.7 pp');
    });

    it('não mostra sinal no zero', () => {
        expect(formatPpBps(0, 'pt-BR')).toBe('0,0 pp');
    });
});
