import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { SessionUser } from '@/app/providers/session-context';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { identityToSessionUser } from '../lib/identity-to-session-user';
import type { AccountIdentity, PreferredLocale } from '../types';
import { accountKeys } from './account-keys';

export function useUpdatePreferences(): UseMutationResult<SessionUser, Error, PreferredLocale> {
    return useMutation({
        mutationKey: accountKeys.preferences(),
        mutationFn: async (locale: PreferredLocale): Promise<SessionUser> => {
            const identity: AccountIdentity = unwrap<AccountIdentity>(await apiClient.PATCH('/auth/me/preferences', { body: { locale } }));
            return identityToSessionUser(identity);
        }
    });
}
