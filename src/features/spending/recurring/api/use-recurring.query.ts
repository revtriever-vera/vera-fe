import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { RecurringOverview } from '../types';
import { recurringKeys } from './recurring-keys';

async function fetchOverview(signal: AbortSignal): Promise<RecurringOverview> {
    return unwrap(await apiClient.GET('/spending/recurring', { signal }));
}

export function useRecurring(): UseQueryResult<RecurringOverview> {
    return useQuery({
        queryKey: recurringKeys.overview(),
        queryFn: async ({ signal }): Promise<RecurringOverview> => fetchOverview(signal)
    });
}

export interface RecurringReviewCountOptions {
    readonly enabled?: boolean;
}

export function useRecurringReviewCount({ enabled = true }: RecurringReviewCountOptions = {}): number | undefined {
    const count: UseQueryResult<number> = useQuery({
        enabled,
        queryKey: recurringKeys.overview(),
        queryFn: async ({ signal }): Promise<RecurringOverview> => fetchOverview(signal),
        select: (data: RecurringOverview): number => data.totals.suggestions.count
    });
    return count.data;
}
