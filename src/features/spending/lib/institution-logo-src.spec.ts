import { describe, expect, it } from 'vitest';
import { institutionLogoSrc } from './institution-logo-src';

describe('institutionLogoSrc', () => {
    it('aponta o caminho da logo para a origem da API', () => {
        expect(institutionLogoSrc('/spending/institution-logos/abc.def', 'https://api.example.test/')).toBe(
            'https://api.example.test/spending/institution-logos/abc.def'
        );
    });

    it('nunca devolve uma URL de terceiros nem caminho de outra rota', () => {
        expect(institutionLogoSrc('https://logos.example.test/nubank.png', 'https://api.example.test')).toBeNull();
        expect(institutionLogoSrc('/spending/accounts', 'https://api.example.test')).toBeNull();
        expect(institutionLogoSrc(null, 'https://api.example.test')).toBeNull();
    });
});
