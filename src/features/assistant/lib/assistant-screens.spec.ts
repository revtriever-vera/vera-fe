import { describe, expect, it } from 'vitest';
import { screenOf, suggestionKeys } from './assistant-screens';

describe('screenOf', () => {
    it.each([
        ['/portfolio/contribution', 'contribution'],
        ['/portfolio/targets', 'targets'],
        ['/portfolio/classes/abc', 'portfolio'],
        ['/portfolio', 'portfolio'],
        ['/spending/transactions', 'transactions'],
        ['/spending', 'spending'],
        ['/settings/profile', 'other'],
        ['/', 'other']
    ])('%s -> %s', (path, screen) => {
        expect(screenOf(path)).toBe(screen);
    });

    it('não confunde prefixo parcial', () => {
        expect(screenOf('/portfolios')).toBe('other');
    });
});

describe('suggestionKeys', () => {
    it('devolve três chaves da tela', () => {
        expect(suggestionKeys('cuts')).toEqual(['suggestions.cuts.one', 'suggestions.cuts.two', 'suggestions.cuts.three']);
    });
});
