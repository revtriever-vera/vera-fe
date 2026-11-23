import { describe, expect, it } from 'vitest';
import { activeLink, linkView, pendingLink } from '../../../../test/fixtures/whatsapp';
import { decidePolling, LINK_POLL_MAX_MS, LINK_POLL_MS } from './link-polling';

const NOW: number = Date.parse('2026-11-22T12:00:00.000Z');
const LATER: string = '2026-11-22T12:09:00.000Z';

describe('decidePolling', () => {
    it('não consulta sem dados, sem vínculo pendente ou já vinculado', () => {
        expect(decidePolling(undefined, null, NOW)).toEqual({ interval: false, startedAt: null });
        expect(decidePolling(linkView(), NOW, NOW)).toEqual({ interval: false, startedAt: null });
        expect(decidePolling(activeLink(), NOW, NOW)).toEqual({ interval: false, startedAt: null });
    });

    it('consulta a cada 3 s enquanto o código está pendente e marca o início', () => {
        expect(decidePolling(pendingLink(LATER), null, NOW)).toEqual({ interval: LINK_POLL_MS, startedAt: NOW });
        expect(LINK_POLL_MS).toBe(3000);
    });

    it('mantém o início já registrado', () => {
        expect(decidePolling(pendingLink(LATER), NOW - 1000, NOW)).toEqual({ interval: LINK_POLL_MS, startedAt: NOW - 1000 });
    });

    it('para ao vencer o código', () => {
        expect(decidePolling(pendingLink('2026-11-22T11:59:59.000Z'), NOW - 1000, NOW).interval).toBe(false);
    });

    it('para depois de 10 minutos', () => {
        const farExpiry: string = '2026-11-22T13:00:00.000Z';
        expect(decidePolling(pendingLink(farExpiry), NOW - LINK_POLL_MAX_MS, NOW).interval).toBe(false);
        expect(decidePolling(pendingLink(farExpiry), NOW - LINK_POLL_MAX_MS + 1, NOW).interval).toBe(LINK_POLL_MS);
    });
});
