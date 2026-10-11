import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { PortfolioSettings, UpdatePortfolioSettings } from '../types';
import { portfolioKeys } from './portfolio-keys';

export function useUpdatePortfolioSettings(): UseMutationResult<PortfolioSettings, ApiError, UpdatePortfolioSettings> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: UpdatePortfolioSettings): Promise<PortfolioSettings> =>
            unwrap(await apiClient.PUT('/allocation/settings', { body: input })),
        onSuccess: async (settings: PortfolioSettings): Promise<void> => {
            queryClient.setQueryData(portfolioKeys.settings(), settings);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: portfolioKeys.settings() }),
                queryClient.invalidateQueries({ queryKey: portfolioKeys.holdings() }),
                queryClient.invalidateQueries({ queryKey: portfolioKeys.overview() }),
                queryClient.invalidateQueries({ queryKey: portfolioKeys.contributions() })
            ]);
        }
    });
}
