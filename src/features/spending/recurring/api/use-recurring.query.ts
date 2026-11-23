import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CalendarEntry, RecurringOverview } from '../types';
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

export function useRecurringCalendar(days: number): UseQueryResult<readonly CalendarEntry[]> {
    return useQuery({
        queryKey: recurringKeys.calendar(days),
        queryFn: async ({ signal }): Promise<readonly CalendarEntry[]> =>
            unwrap(await apiClient.GET('/spending/recurring/calendar', { params: { query: { days } }, signal }))
    });
}
