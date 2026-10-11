import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { Recategorized } from '../../types';
import { invalidateRules } from './invalidate-rules';

export interface DeleteCategoryInput {
    readonly id: string;
    readonly moveTo: string | null;
}

export function useDeleteCategory(): UseMutationResult<Recategorized, ApiError, DeleteCategoryInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, moveTo }: DeleteCategoryInput): Promise<Recategorized> =>
            unwrap(
                await apiClient.DELETE('/spending/categories/{id}', {
                    params: { path: { id }, query: moveTo === null ? {} : { moveTo } }
                })
            ),
        onSuccess: async (): Promise<void> => {
            await invalidateRules(queryClient);
        }
    });
}
