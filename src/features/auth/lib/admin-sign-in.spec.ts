import { describe, expect, it } from 'vitest';
import type { LoginSession } from '../types';
import { loginSession } from '../../../../test/fixtures/auth';
import { resolveAdminSignIn } from './admin-sign-in';

describe('resolveAdminSignIn', () => {
    it('lets an authenticated session through', () => {
        const session: LoginSession = loginSession();
        expect(resolveAdminSignIn(session)).toBe(session);
    });

    it('refuses a step it does not know yet', () => {
        const session: { readonly outcome: string } = { outcome: 'totp_required' };
        expect(() => resolveAdminSignIn(session)).toThrow();
    });
});
