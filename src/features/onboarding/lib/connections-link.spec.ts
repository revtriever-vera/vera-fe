import { describe, expect, it } from 'vitest';
import { ONBOARDING_DESTINATIONS } from '@/app/onboarding-destinations';
import { resolveConnectionsLink, resolveImportLink } from './connections-link';

describe('resolveConnectionsLink', () => {
    it('trata a raiz como destino ausente e repassa os demais', () => {
        expect(resolveConnectionsLink('/')).toBeNull();
        expect(resolveConnectionsLink('/spending/connections')).toBe('/spending/connections');
    });

    it('o destino real do onboarding é a tela de Conexões', () => {
        expect(resolveConnectionsLink(ONBOARDING_DESTINATIONS.connections)).toBe('/spending/connections');
    });
});

describe('resolveImportLink', () => {
    it('acrescenta import=true ao destino de Conexões e some quando não há destino', () => {
        expect(resolveImportLink('/spending/connections')).toBe('/spending/connections?import=true');
        expect(resolveImportLink(null)).toBeNull();
    });
});
