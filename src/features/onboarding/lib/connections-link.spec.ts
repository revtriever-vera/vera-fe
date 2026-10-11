import { describe, expect, it } from 'vitest';
import { ONBOARDING_DESTINATIONS } from '@/app/onboarding-destinations';
import { resolveConnectionsLink } from './connections-link';

describe('resolveConnectionsLink', () => {
    it('trata a raiz como destino ausente e repassa os demais', () => {
        expect(resolveConnectionsLink('/')).toBeNull();
        expect(resolveConnectionsLink('/spending/connections')).toBe('/spending/connections');
    });

    it('o destino real do onboarding é a tela de Conexões', () => {
        expect(resolveConnectionsLink(ONBOARDING_DESTINATIONS.connections)).toBe('/spending/connections');
    });
});
