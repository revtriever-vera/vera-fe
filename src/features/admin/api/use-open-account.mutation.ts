import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { AccessInput, AccountAccess } from '../types';

export interface OpenAccountVariables {
    readonly id: string;
    readonly input: AccessInput;
}

export function useOpenAccount(): UseMutationResult<AccountAccess, ApiError, OpenAccountVariables> {
    return useMutation({
        mutationFn: async ({ id, input }: OpenAccountVariables): Promise<AccountAccess> =>
            unwrap<AccountAccess>(await apiClient.POST('/platform/accounts/{id}/access', { params: { path: { id } }, body: input }))
    });
}
