import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { ExchangeRateView } from '../types';

const RATE_STALE_MS: number = 5 * 60 * 1000;

export function useExchangeRate(currency: string, enabled: boolean): UseQueryResult<ExchangeRateView> {
    return useQuery({
        queryKey: portfolioKeys.exchangeRate(currency),
        queryFn: async ({ signal }): Promise<ExchangeRateView> =>
            unwrap(await apiClient.GET('/market-data/exchange-rates/{currency}', { params: { path: { currency } }, signal })),
        enabled,
        staleTime: RATE_STALE_MS
    });
}
