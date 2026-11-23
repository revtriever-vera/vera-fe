import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { RealRatesResponse } from '../types';

export const INDEX_DATA_MISSING_TYPE: string = 'fixed_income.index_data_missing';

const DEFAULT_RETRIES: number = 3;

export function isIndexDataMissing(error: Error | null): boolean {
    return error instanceof ApiError && error.problem.type === INDEX_DATA_MISSING_TYPE;
}

function shouldRetry(failureCount: number, error: Error): boolean {
    return !isIndexDataMissing(error) && failureCount < DEFAULT_RETRIES;
}

export function useRealRates(): UseQueryResult<RealRatesResponse> {
    return useQuery({
        queryKey: portfolioKeys.realRates(),
        staleTime: 0,
        retry: shouldRetry,
        queryFn: async ({ signal }): Promise<RealRatesResponse> => unwrap(await apiClient.GET('/portfolio/real-rates', { signal }))
    });
}
