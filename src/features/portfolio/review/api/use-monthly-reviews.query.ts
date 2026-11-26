import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { MonthlyReviewList } from '../types';
import { reviewKeys } from './review-keys';

export function useMonthlyReviews(): UseQueryResult<MonthlyReviewList> {
    return useQuery({
        queryKey: reviewKeys.list(),
        queryFn: async ({ signal }): Promise<MonthlyReviewList> =>
            unwrap(await apiClient.GET('/portfolio-watch/monthly-reviews', { signal }))
    });
}
