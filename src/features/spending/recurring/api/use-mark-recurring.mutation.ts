import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { invalidateSpending } from '../../api/invalidate-spending';
import type { MarkRecurringResult } from '../types';
import { recurringKeys } from './recurring-keys';

export function useMarkRecurring(): UseMutationResult<MarkRecurringResult, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (fromTransactionId: string): Promise<MarkRecurringResult> =>
            unwrap(await apiClient.POST('/spending/recurring', { body: { fromTransactionId } })),
        onSuccess: async (): Promise<void> => {
            await Promise.all([queryClient.invalidateQueries({ queryKey: recurringKeys.all }), invalidateSpending(queryClient)]);
        }
    });
}
