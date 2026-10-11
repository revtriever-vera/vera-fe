import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { ClassesResponse } from '../../types';

export function useResetTargets(): UseMutationResult<ClassesResponse, ApiError, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<ClassesResponse> => unwrap(await apiClient.POST('/allocation/targets/reset')),
        onSuccess: async (classes: ClassesResponse): Promise<void> => {
            queryClient.setQueryData(portfolioKeys.classes(), classes);
            await Promise.all([
                invalidatePortfolio(queryClient),
                queryClient.invalidateQueries({ queryKey: portfolioKeys.contributions() })
            ]);
        }
    });
}
