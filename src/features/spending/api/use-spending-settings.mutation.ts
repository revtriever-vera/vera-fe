import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { SpendingSettings, UpdateSpendingSettings } from '../types';
import { spendingKeys } from './spending-keys';

export function useUpdateSpendingSettings(): UseMutationResult<SpendingSettings, ApiError, UpdateSpendingSettings> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: UpdateSpendingSettings): Promise<SpendingSettings> =>
            unwrap(await apiClient.PUT('/spending/settings', { body: input })),
        onSuccess: async (settings: SpendingSettings): Promise<void> => {
            queryClient.setQueryData(spendingKeys.settings(), settings);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: spendingKeys.settings() }),
                queryClient.invalidateQueries({ queryKey: spendingKeys.summaries() }),
                queryClient.invalidateQueries({ queryKey: spendingKeys.cutsList() })
            ]);
        }
    });
}
