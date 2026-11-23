import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { NoticeBeforeList } from '../types';
import { recurringKeys } from './recurring-keys';

export function useNoticeBefore(): UseQueryResult<NoticeBeforeList> {
    return useQuery({
        queryKey: recurringKeys.noticeBefore(),
        queryFn: async ({ signal }): Promise<NoticeBeforeList> =>
            unwrap(await apiClient.GET('/spending/recurring/notice-before', { signal }))
    });
}
