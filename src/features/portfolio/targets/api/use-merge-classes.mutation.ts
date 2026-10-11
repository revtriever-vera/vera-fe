import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { AssetClassView } from '../../types';

export interface MergeClassesInput {
    readonly id: string;
    readonly intoClassId: string;
}

export function useMergeClasses(): UseMutationResult<AssetClassView, ApiError, MergeClassesInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, intoClassId }: MergeClassesInput): Promise<AssetClassView> =>
            unwrap(await apiClient.POST('/allocation/classes/{id}/merge', { params: { path: { id } }, body: { intoClassId } })),
        onSettled: async (): Promise<void> => {
            await invalidatePortfolio(queryClient);
        }
    });
}
