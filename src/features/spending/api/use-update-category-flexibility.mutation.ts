import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CategoryFlexibility, CategoryView } from '../types';
import { invalidateSpending } from './invalidate-spending';
import { spendingKeys } from './spending-keys';

export interface UpdateCategoryFlexibilityInput {
    readonly id: string;
    readonly flexibility: CategoryFlexibility;
}

export function useUpdateCategoryFlexibility(): UseMutationResult<CategoryView, ApiError, UpdateCategoryFlexibilityInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, flexibility }: UpdateCategoryFlexibilityInput): Promise<CategoryView> =>
            unwrap(await apiClient.PATCH('/spending/categories/{id}', { params: { path: { id } }, body: { flexibility } })),
        onSuccess: async (): Promise<void> => {
            await Promise.all([invalidateSpending(queryClient), queryClient.invalidateQueries({ queryKey: spendingKeys.categories() })]);
        }
    });
}
