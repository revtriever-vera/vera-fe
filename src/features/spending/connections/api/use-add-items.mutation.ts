import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { AddItemsBody, AddItemsResponse } from '../types';
import { invalidateConnections } from './invalidate-connections';

export function useAddItems(): UseMutationResult<AddItemsResponse, ApiError, AddItemsBody> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: AddItemsBody): Promise<AddItemsResponse> =>
            unwrap(await apiClient.POST('/spending/connections', { body })),
        onSuccess: async (): Promise<void> => {
            await invalidateConnections(queryClient);
        }
    });
}
