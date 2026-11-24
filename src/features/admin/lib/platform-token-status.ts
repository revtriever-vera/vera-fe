import type { PlatformToken } from '../types';

export type TokenStatus = 'active' | 'expired' | 'revoked';

export const TOKEN_STATUS: { readonly active: 'active'; readonly expired: 'expired'; readonly revoked: 'revoked' } = {
    active: 'active',
    expired: 'expired',
    revoked: 'revoked'
};

export function tokenStatus(token: PlatformToken, now: Date): TokenStatus {
    if (token.revokedAt !== null) {
        return TOKEN_STATUS.revoked;
    }
    return new Date(token.expiresAt).getTime() <= now.getTime() ? TOKEN_STATUS.expired : TOKEN_STATUS.active;
}
