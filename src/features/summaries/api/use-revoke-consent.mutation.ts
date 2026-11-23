import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { aiKeys } from './ai-keys';

export function useRevokeConsent(): UseMutationResult<void, ApiError, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<void> => {
            unwrapEmpty(await apiClient.DELETE('/ai/consent'));
        },
        onSuccess: async (): Promise<void> => {
            queryClient.removeQueries({ queryKey: aiKeys.summaries() });
            await queryClient.invalidateQueries({ queryKey: aiKeys.all });
        }
    });
}
