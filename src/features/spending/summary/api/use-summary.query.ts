import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { spendingKeys } from '../../api/spending-keys';
import type { MonthlySummary } from '../../types';

export function useSummary(month: string | undefined): UseQueryResult<MonthlySummary> {
    return useQuery({
        queryKey: spendingKeys.summary(month ?? null),
        placeholderData: keepPreviousData,
        queryFn: async ({ signal }): Promise<MonthlySummary> =>
            unwrap(await apiClient.GET('/spending/summary', { params: { query: month === undefined ? {} : { month } }, signal }))
    });
}
