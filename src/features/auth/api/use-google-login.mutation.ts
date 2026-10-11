import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { LoginSession } from '../types';
import { authKeys } from './auth-keys';
import { completeSignIn, type CompletedSignIn } from './complete-sign-in';

export function useGoogleLogin(): UseMutationResult<CompletedSignIn, Error, string> {
    return useMutation({
        mutationKey: authKeys.login('google'),
        mutationFn: async (idToken: string): Promise<CompletedSignIn> => {
            const session: LoginSession = unwrap<LoginSession>(await apiClient.POST('/auth/google', { body: { idToken } }));
            return completeSignIn(session);
        }
    });
}
