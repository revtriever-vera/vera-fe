import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { invalidateConnections } from './invalidate-connections';

export function useSyncAll(): UseMutationResult<{ queued: number }, ApiError, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<{ queued: number }> => unwrap(await apiClient.POST('/spending/connections/sync')),
        onSuccess: async (): Promise<void> => {
            await invalidateConnections(queryClient);
        }
    });
}
