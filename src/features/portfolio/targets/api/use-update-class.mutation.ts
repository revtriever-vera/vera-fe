import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { AssetClassView, UpdateClassBody } from '../../types';

export interface UpdateClassInput {
    readonly id: string;
    readonly body: UpdateClassBody;
}

export function useUpdateClass(): UseMutationResult<AssetClassView, ApiError, UpdateClassInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: UpdateClassInput): Promise<AssetClassView> =>
            unwrap(await apiClient.PATCH('/allocation/classes/{id}', { params: { path: { id } }, body })),
        onSettled: async (): Promise<void> => {
            await invalidatePortfolio(queryClient);
        }
    });
}
