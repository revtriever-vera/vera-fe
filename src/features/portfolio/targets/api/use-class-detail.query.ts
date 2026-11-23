import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import { holderQuery } from '../../lib/holder-filter';
import type { ClassDetail } from '../types';

export function useClassDetail(classId: string, holder?: string): UseQueryResult<ClassDetail> {
    return useQuery({
        queryKey: portfolioKeys.classDetailOf(classId, holder),
        queryFn: async ({ signal }): Promise<ClassDetail> =>
            unwrap(
                await apiClient.GET('/portfolio/classes/{classId}', { params: { path: { classId }, query: holderQuery(holder) }, signal })
            )
    });
}
