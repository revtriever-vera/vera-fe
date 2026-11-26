import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { MonthlyReview } from '../types';
import { reviewKeys } from './review-keys';

export function useMonthlyReview(month: string | undefined): UseQueryResult<MonthlyReview> {
    return useQuery({
        queryKey: reviewKeys.month(month ?? ''),
        queryFn: async ({ signal }): Promise<MonthlyReview> =>
            unwrap(
                await apiClient.GET('/portfolio-watch/monthly-reviews/{month}', {
                    params: { path: { month: month ?? '' } },
                    signal
                })
            ),
        enabled: month !== undefined
    });
}
