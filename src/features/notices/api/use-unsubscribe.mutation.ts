import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { UnsubscribeResult } from '../types';

export function useUnsubscribe(): UseMutationResult<UnsubscribeResult, ApiError, string> {
    return useMutation({
        mutationFn: async (token: string): Promise<UnsubscribeResult> =>
            unwrap(await apiClient.POST('/notifications/unsubscribe/{token}', { params: { path: { token } } }))
    });
}
