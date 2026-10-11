import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { PositionView, UpdatePositionBody } from '../types';

export interface UpdatePositionInput {
    readonly id: string;
    readonly body: UpdatePositionBody;
}

export function useUpdatePosition(): UseMutationResult<PositionView, ApiError, UpdatePositionInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: UpdatePositionInput): Promise<PositionView> =>
            unwrap(await apiClient.PATCH('/positions/{id}', { params: { path: { id } }, body })),
        onSettled: async (_data, _error, input: UpdatePositionInput): Promise<void> => {
            await Promise.all([
                invalidatePortfolio(queryClient),
                queryClient.invalidateQueries({ queryKey: portfolioKeys.position(input.id) })
            ]);
        }
    });
}
