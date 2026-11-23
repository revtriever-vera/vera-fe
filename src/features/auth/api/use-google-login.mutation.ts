import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { GoogleLoginResponse, LoginSession } from '../types';
import { requireAuthenticated } from '../lib/admin-sign-in';
import { authKeys } from './auth-keys';
import { completeSignIn, type CompletedSignIn } from './complete-sign-in';

export function useGoogleLogin(inviteToken?: string, offerToken?: string): UseMutationResult<CompletedSignIn, Error, string> {
    return useMutation({
        mutationKey: authKeys.login('google'),
        mutationFn: async (idToken: string): Promise<CompletedSignIn> => {
            const response: GoogleLoginResponse = unwrap<GoogleLoginResponse>(
                await apiClient.POST('/auth/google', {
                    body: {
                        idToken,
                        ...(inviteToken === undefined ? {} : { inviteToken }),
                        ...(offerToken === undefined ? {} : { offerToken })
                    }
                })
            );
            const session: LoginSession = requireAuthenticated(response);
            return completeSignIn(session);
        }
    });
}
