import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { FixedIncomePreview, FixedIncomePreviewBody } from '../types';

export function useFixedIncomePreview(body: FixedIncomePreviewBody | null): UseQueryResult<FixedIncomePreview> {
    return useQuery({
        queryKey: portfolioKeys.fixedIncomePreview(body ?? {}),
        queryFn: async ({ signal }): Promise<FixedIncomePreview> => {
            if (body === null) {
                throw new Error('missing preview body');
            }
            return unwrap(await apiClient.POST('/fixed-income/preview', { body, signal }));
        },
        enabled: body !== null
    });
}
