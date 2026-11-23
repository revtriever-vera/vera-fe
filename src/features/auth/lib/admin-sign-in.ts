import type { GoogleLoginResponse, LoginSession } from '../types';

export type AdminSignInStep =
    | { readonly kind: 'session'; readonly session: LoginSession }
    | { readonly kind: 'challenge'; readonly challengeToken: string }
    | { readonly kind: 'enrollment'; readonly setupToken: string };

export function resolveAdminSignIn(response: GoogleLoginResponse): AdminSignInStep {
    switch (response.outcome) {
        case 'authenticated':
            return { kind: 'session', session: response };
        case 'totp_required':
            return { kind: 'challenge', challengeToken: response.challengeToken };
        case 'totp_enrollment_required':
            return { kind: 'enrollment', setupToken: response.setupToken };
    }
}

export function requireAuthenticated(response: GoogleLoginResponse): LoginSession {
    if (response.outcome !== 'authenticated') {
        throw new Error('sign-in step reserved for the admin audience');
    }
    return response;
}
