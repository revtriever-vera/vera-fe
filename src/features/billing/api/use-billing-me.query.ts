import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { BillingMe } from '../types';
import { billingKeys } from './billing-keys';

const BILLING_STALE_TIME_MS: number = 60_000;

export function useBillingMe(): UseQueryResult<BillingMe> {
    return useQuery({
        queryKey: billingKeys.me(),
        staleTime: BILLING_STALE_TIME_MS,
        refetchOnWindowFocus: 'always',
        queryFn: async ({ signal }): Promise<BillingMe> => unwrap(await apiClient.GET('/billing/me', { signal }))
    });
}
