import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CategoryView, UpdateCategoryBody } from '../../types';
import { invalidateRules } from './invalidate-rules';

export interface UpdateCategoryInput {
    readonly id: string;
    readonly body: UpdateCategoryBody;
}

export function useUpdateCategory(): UseMutationResult<CategoryView, ApiError, UpdateCategoryInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: UpdateCategoryInput): Promise<CategoryView> =>
            unwrap(await apiClient.PATCH('/spending/categories/{id}', { params: { path: { id } }, body })),
        onSuccess: async (): Promise<void> => {
            await invalidateRules(queryClient);
        }
    });
}
