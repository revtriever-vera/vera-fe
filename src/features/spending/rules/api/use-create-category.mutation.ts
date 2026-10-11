import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CategoryView, CreateCategoryBody } from '../../types';
import { invalidateRules } from './invalidate-rules';

export function useCreateCategory(): UseMutationResult<CategoryView, ApiError, CreateCategoryBody> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateCategoryBody): Promise<CategoryView> =>
            unwrap(await apiClient.POST('/spending/categories', { body })),
        onSuccess: async (): Promise<void> => {
            await invalidateRules(queryClient);
        }
    });
}
