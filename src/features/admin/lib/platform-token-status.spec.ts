import { describe, expect, it } from 'vitest';
import { platformToken } from '../../../../test/fixtures/admin';
import { TOKEN_STATUS, tokenStatus } from './platform-token-status';

const NOW: Date = new Date('2026-11-23T12:00:00.000Z');

describe('tokenStatus', () => {
    it('is active before the expiry and not revoked', () => {
        expect(tokenStatus(platformToken({ expiresAt: '2026-12-01T00:00:00.000Z' }), NOW)).toBe(TOKEN_STATUS.active);
    });

    it('is expired at and after the expiry', () => {
        expect(tokenStatus(platformToken({ expiresAt: '2026-11-23T12:00:00.000Z' }), NOW)).toBe(TOKEN_STATUS.expired);
    });

    it('is revoked even when it would also be expired', () => {
        expect(tokenStatus(platformToken({ expiresAt: '2020-01-01T00:00:00.000Z', revokedAt: '2026-11-01T00:00:00.000Z' }), NOW)).toBe(
            TOKEN_STATUS.revoked
        );
    });
});
