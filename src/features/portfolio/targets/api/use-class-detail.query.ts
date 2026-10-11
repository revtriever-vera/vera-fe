import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { ClassDetail } from '../types';

export function useClassDetail(classId: string): UseQueryResult<ClassDetail> {
    return useQuery({
        queryKey: portfolioKeys.classDetail(classId),
        queryFn: async ({ signal }): Promise<ClassDetail> =>
            unwrap(await apiClient.GET('/portfolio/classes/{classId}', { params: { path: { classId } }, signal }))
    });
}
