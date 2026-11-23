import { describe, expect, it } from 'vitest';
import type { GoogleLoginResponse, LoginSession } from '../types';
import { loginSession } from '../../../../test/fixtures/auth';
import { requireAuthenticated, resolveAdminSignIn } from './admin-sign-in';

describe('resolveAdminSignIn', () => {
    it('lets an authenticated session through', () => {
        const session: LoginSession = loginSession();
        expect(resolveAdminSignIn(session)).toEqual({ kind: 'session', session });
    });

    it('turns the challenge into the code step', () => {
        const response: GoogleLoginResponse = { outcome: 'totp_required', challengeToken: 'challenge-1' };
        expect(resolveAdminSignIn(response)).toEqual({ kind: 'challenge', challengeToken: 'challenge-1' });
    });

    it('turns the setup token into the enrollment step', () => {
        const response: GoogleLoginResponse = { outcome: 'totp_enrollment_required', setupToken: 'setup-1' };
        expect(resolveAdminSignIn(response)).toEqual({ kind: 'enrollment', setupToken: 'setup-1' });
    });
});

describe('requireAuthenticated', () => {
    it('returns the session of a regular login', () => {
        const session: LoginSession = loginSession();
        expect(requireAuthenticated(session)).toBe(session);
    });

    it('refuses a second-factor step outside the admin audience', () => {
        const response: GoogleLoginResponse = { outcome: 'totp_required', challengeToken: 'challenge-1' };
        expect(() => requireAuthenticated(response)).toThrow();
    });
});
