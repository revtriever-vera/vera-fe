import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { BillingMe } from '../types';
import { billingKeys } from './billing-keys';

export function useResumeSubscription(): UseMutationResult<BillingMe, Error, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<BillingMe> => unwrap<BillingMe>(await apiClient.POST('/billing/subscription/resume')),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: billingKeys.all });
        }
    });
}
