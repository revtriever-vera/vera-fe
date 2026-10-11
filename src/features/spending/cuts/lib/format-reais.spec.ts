import { describe, expect, it } from 'vitest';
import { formatWhole } from './format-reais';

describe('formatWhole', () => {
    it('arredonda para reais inteiros', () => {
        expect(formatWhole(72103, 'pt-BR').replace(/\s/g, ' ')).toBe('R$ 721');
        expect(formatWhole(162897, 'pt-BR').replace(/\s/g, ' ')).toBe('R$ 1.629');
    });

    it('segue o idioma', () => {
        expect(formatWhole(224000, 'en')).toBe('R$2,240');
    });
});
