import { describe, expect, it } from 'vitest';
import { issuerKindFor, keepsIssuer } from './issuer-kind';

describe('issuerKindFor', () => {
    it.each(['cdb', 'lci', 'lca', 'lc'] as const)('%s pede emissor bancário', (kind) => {
        expect(issuerKindFor(kind)).toBe('bank');
    });

    it.each(['debenture', 'cri', 'cra'] as const)('%s pede emissor empresa', (kind) => {
        expect(issuerKindFor(kind)).toBe('company');
    });
});

describe('keepsIssuer', () => {
    it('mantém o emissor do mesmo grupo e solta o de outro grupo', () => {
        expect(keepsIssuer('lci', { kind: 'bank' })).toBe(true);
        expect(keepsIssuer('debenture', { kind: 'bank' })).toBe(false);
        expect(keepsIssuer('cri', { kind: 'sovereign' })).toBe(false);
    });

    it('sem emissor não há o que manter', () => {
        expect(keepsIssuer('cdb', null)).toBe(false);
    });
});
