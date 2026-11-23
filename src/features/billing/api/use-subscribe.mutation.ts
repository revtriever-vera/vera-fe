import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CheckoutMethod, SubscribeResult } from '../types';
import { billingKeys } from './billing-keys';

export function useSubscribe(): UseMutationResult<SubscribeResult, Error, CheckoutMethod> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (method: CheckoutMethod): Promise<SubscribeResult> =>
            unwrap<SubscribeResult>(await apiClient.POST('/billing/subscription', { body: { method } })),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: billingKeys.me() });
        }
    });
}
