import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { CreateTitleBody, TitleView } from '../types';

export function useCreateFixedIncomeTitle(): UseMutationResult<TitleView, ApiError, CreateTitleBody> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateTitleBody): Promise<TitleView> => unwrap(await apiClient.POST('/fixed-income/titles', { body })),
        onSettled: async (): Promise<void> => {
            await invalidatePortfolio(queryClient);
        }
    });
}
