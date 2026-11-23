import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { PaymentLink } from '../types';
import { billingKeys } from './billing-keys';

export function useInvoicePaymentLink(): UseMutationResult<PaymentLink, Error, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoiceId: string): Promise<PaymentLink> =>
            unwrap(await apiClient.GET('/billing/invoices/{id}/payment-link', { params: { path: { id: invoiceId } } })),
        onSettled: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: billingKeys.me() });
        }
    });
}
