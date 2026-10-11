import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { CreatePositionBody, PositionView } from '../types';

export function useCreatePosition(): UseMutationResult<PositionView, ApiError, CreatePositionBody> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreatePositionBody): Promise<PositionView> => unwrap(await apiClient.POST('/positions', { body })),
        onSettled: async (): Promise<void> => {
            await invalidatePortfolio(queryClient);
        }
    });
}
