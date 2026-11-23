import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { BillingMe } from '../types';
import { billingKeys } from './billing-keys';

export function useConfirmCard(): UseMutationResult<BillingMe, Error, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<BillingMe> => unwrap<BillingMe>(await apiClient.POST('/billing/payment-method/confirm')),
        onSuccess: (me: BillingMe): void => {
            queryClient.setQueryData(billingKeys.me(), me);
        }
    });
}
