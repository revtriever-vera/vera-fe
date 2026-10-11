import { describe, expect, it } from 'vitest';
import { formatQuantity } from './format-quantity';

describe('formatQuantity', () => {
    it('respeita o locale e corta zeros à direita', () => {
        expect(formatQuantity('0.45', 8, 'pt-BR')).toBe('0,45');
        expect(formatQuantity('0.45', 8, 'en')).toBe('0.45');
        expect(formatQuantity('3.2', 2, 'pt-BR')).toBe('3,2');
    });

    it('agrupa milhares e trata decimais nulos como inteiro', () => {
        expect(formatQuantity('12000', null, 'pt-BR')).toBe('12.000');
    });
});
