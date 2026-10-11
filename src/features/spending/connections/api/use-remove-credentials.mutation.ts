import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import { invalidateSpending } from '../../api/invalidate-spending';
import type { RemoveOptions } from '../types';
import { invalidateConnections } from './invalidate-connections';

export function useRemoveCredentials(): UseMutationResult<void, ApiError, RemoveOptions> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ purgeTransactions }: RemoveOptions): Promise<void> => {
            unwrapEmpty(
                await apiClient.DELETE('/spending/connections/credentials', {
                    params: { query: { purgeTransactions: purgeTransactions ? 'true' : 'false' } }
                })
            );
        },
        onSuccess: async (): Promise<void> => {
            await Promise.all([invalidateConnections(queryClient), invalidateSpending(queryClient)]);
        }
    });
}
