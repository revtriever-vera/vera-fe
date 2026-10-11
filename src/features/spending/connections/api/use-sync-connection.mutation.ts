import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { invalidateConnections } from './invalidate-connections';

export function useSyncConnection(): UseMutationResult<{ queued: boolean }, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<{ queued: boolean }> =>
            unwrap(await apiClient.POST('/spending/connections/{id}/sync', { params: { path: { id } } })),
        onSuccess: async (): Promise<void> => {
            await invalidateConnections(queryClient);
        }
    });
}
