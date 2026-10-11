import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { AssetClassView, CreateClassInput } from '../../types';

export function useCreateClass(): UseMutationResult<AssetClassView, ApiError, CreateClassInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateClassInput): Promise<AssetClassView> =>
            unwrap(await apiClient.POST('/allocation/classes', { body: input })),
        onSettled: async (): Promise<void> => {
            await invalidatePortfolio(queryClient);
        }
    });
}
