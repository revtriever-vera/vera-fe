import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { EventsView } from '../types';
import { calendarKeys } from './calendar-keys';

export function useCalendarEvents(): UseQueryResult<EventsView> {
    return useQuery({
        queryKey: calendarKeys.events(),
        staleTime: 0,
        queryFn: async ({ signal }): Promise<EventsView> => unwrap(await apiClient.GET('/calendar/events', { signal }))
    });
}
