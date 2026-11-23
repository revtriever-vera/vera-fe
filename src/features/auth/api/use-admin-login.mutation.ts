import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { authKeys } from './auth-keys';
import { completeSignIn, type CompletedSignIn } from './complete-sign-in';
import type { LoginSession } from '../types';
import { resolveAdminSignIn } from '../lib/admin-sign-in';

export function useAdminLogin(): UseMutationResult<CompletedSignIn, Error, string> {
    return useMutation({
        mutationKey: authKeys.login('admin'),
        mutationFn: async (idToken: string): Promise<CompletedSignIn> => {
            const session: LoginSession = unwrap<LoginSession>(
                await apiClient.POST('/auth/google', { body: { idToken, audience: 'admin' } })
            );
            return completeSignIn(resolveAdminSignIn(session));
        }
    });
}
