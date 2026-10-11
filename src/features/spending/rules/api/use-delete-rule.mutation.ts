import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { Recategorized } from '../../types';
import { invalidateRules } from './invalidate-rules';

export function useDeleteRule(): UseMutationResult<Recategorized, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<Recategorized> =>
            unwrap(await apiClient.DELETE('/spending/rules/{id}', { params: { path: { id } } })),
        onSuccess: async (): Promise<void> => {
            await invalidateRules(queryClient);
        }
    });
}
