import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { TitleDetail, UpdateTitleBody } from '../types';

export interface UpdateTitleInput {
    readonly id: string;
    readonly body: UpdateTitleBody;
}

export function useUpdateFixedIncomeTitle(): UseMutationResult<TitleDetail, ApiError, UpdateTitleInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: UpdateTitleInput): Promise<TitleDetail> =>
            unwrap(await apiClient.PATCH('/fixed-income/titles/{id}', { params: { path: { id } }, body })),
        onSettled: async (_data, _error, input: UpdateTitleInput): Promise<void> => {
            await Promise.all([
                invalidatePortfolio(queryClient),
                queryClient.invalidateQueries({ queryKey: portfolioKeys.fixedIncomeTitle(input.id) })
            ]);
        }
    });
}
