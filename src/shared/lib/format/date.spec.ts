import { describe, expect, it } from 'vitest';
import { formatDate } from './date';

const SAME_INSTANT: Date = new Date('2026-01-15T14:30:00Z');

describe('formatDate', () => {
    it('usa o fuso do dado, não o do navegador: mesmo instante, horas diferentes', () => {
        const inSaoPaulo: string = formatDate(SAME_INSTANT, 'pt-BR', 'America/Sao_Paulo');
        const inMexicoCity: string = formatDate(SAME_INSTANT, 'pt-BR', 'America/Mexico_City');
        expect(inSaoPaulo).not.toBe(inMexicoCity);
    });

    it('o locale controla só o formato textual, com o mesmo fuso', () => {
        const inPortuguese: string = formatDate(SAME_INSTANT, 'pt-BR', 'America/Sao_Paulo');
        const inEnglish: string = formatDate(SAME_INSTANT, 'en', 'America/Sao_Paulo');
        expect(inPortuguese).toBe('15/01/2026, 11:30');
        expect(inEnglish).toBe('1/15/26, 11:30 AM');
    });
});
