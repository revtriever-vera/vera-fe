import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ConnectionView } from '../types';
import { calendarKeys } from './calendar-keys';

export function useCalendarConnection(enabled: boolean): UseQueryResult<ConnectionView> {
    return useQuery({
        queryKey: calendarKeys.connection(),
        enabled,
        staleTime: 0,
        queryFn: async ({ signal }): Promise<ConnectionView> => unwrap(await apiClient.GET('/calendar/connection', { signal }))
    });
}
