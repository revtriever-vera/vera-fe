import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import { accountKeys } from './account-keys';

export function useDeleteAccount(): UseMutationResult<void, Error, string> {
    return useMutation({
        mutationKey: accountKeys.erasure(),
        mutationFn: async (confirmEmail: string): Promise<void> => {
            unwrapEmpty(await apiClient.DELETE('/account', { body: { confirmEmail } }));
        }
    });
}
