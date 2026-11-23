import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { NoticePreferences } from '../types';
import { noticesKeys } from './notices-keys';

export function useNoticePreferences(): UseQueryResult<NoticePreferences> {
    return useQuery({
        queryKey: noticesKeys.preferences(),
        queryFn: async ({ signal }): Promise<NoticePreferences> => unwrap(await apiClient.GET('/notifications/preferences', { signal }))
    });
}
