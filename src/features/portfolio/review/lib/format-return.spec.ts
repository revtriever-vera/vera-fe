import { describe, expect, it } from 'vitest';
import { formatReturnPct } from './format-return';

describe('formatReturnPct', () => {
    it('põe sinal e duas casas, no idioma pedido', () => {
        expect(formatReturnPct(1.42, 'pt-BR')).toBe('+1,42%');
        expect(formatReturnPct(1.42, 'en')).toBe('+1.42%');
    });

    it('usa o sinal de menos tipográfico nas quedas', () => {
        expect(formatReturnPct(-6.25, 'pt-BR')).toBe('−6,25%');
    });

    it('zero não leva sinal', () => {
        expect(formatReturnPct(0, 'pt-BR')).toBe('0,00%');
    });
});
