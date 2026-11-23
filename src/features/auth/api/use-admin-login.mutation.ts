import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { authKeys } from './auth-keys';
import { completeSignIn, type CompletedSignIn } from './complete-sign-in';
import type { GoogleLoginResponse, TotpEnrollment } from '../types';
import { resolveAdminSignIn, type AdminSignInStep } from '../lib/admin-sign-in';

export type AdminLoginResult =
    | { readonly kind: 'signed_in'; readonly completed: CompletedSignIn }
    | { readonly kind: 'challenge'; readonly challengeToken: string }
    | { readonly kind: 'enrollment'; readonly setupToken: string; readonly enrollment: TotpEnrollment };

async function startEnrollment(setupToken: string): Promise<AdminLoginResult> {
    const enrollment: TotpEnrollment = unwrap<TotpEnrollment>(await apiClient.POST('/auth/totp/enroll', { body: { setupToken } }));
    return { kind: 'enrollment', setupToken, enrollment };
}

async function followStep(step: AdminSignInStep): Promise<AdminLoginResult> {
    if (step.kind === 'session') {
        return { kind: 'signed_in', completed: await completeSignIn(step.session) };
    }
    if (step.kind === 'challenge') {
        return step;
    }
    return startEnrollment(step.setupToken);
}

export function useAdminLogin(): UseMutationResult<AdminLoginResult, Error, string> {
    return useMutation({
        mutationKey: authKeys.login('admin'),
        mutationFn: async (idToken: string): Promise<AdminLoginResult> => {
            const response: GoogleLoginResponse = unwrap<GoogleLoginResponse>(
                await apiClient.POST('/auth/google', { body: { idToken, audience: 'admin' } })
            );
            return followStep(resolveAdminSignIn(response));
        }
    });
}
