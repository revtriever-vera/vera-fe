import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CancelResult } from '../types';
import { billingKeys } from './billing-keys';

export function useCancelSubscription(): UseMutationResult<CancelResult, Error, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<CancelResult> => unwrap<CancelResult>(await apiClient.POST('/billing/subscription/cancel')),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: billingKeys.all });
        }
    });
}
