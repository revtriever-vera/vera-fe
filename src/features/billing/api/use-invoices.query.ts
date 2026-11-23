import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { InvoicesPage } from '../types';
import { billingKeys } from './billing-keys';

export function useInvoices(page: number): UseQueryResult<InvoicesPage> {
    return useQuery({
        queryKey: billingKeys.invoices(page),
        placeholderData: keepPreviousData,
        queryFn: async ({ signal }): Promise<InvoicesPage> =>
            unwrap<InvoicesPage>(await apiClient.GET('/billing/invoices', { params: { query: { page } }, signal }))
    });
}
