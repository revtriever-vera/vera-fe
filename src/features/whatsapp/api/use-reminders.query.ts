import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { RemindersView } from '../types';
import { whatsappKeys } from './whatsapp-keys';

export function useReminders(): UseQueryResult<RemindersView> {
    return useQuery({
        queryKey: whatsappKeys.reminders(),
        queryFn: async ({ signal }): Promise<RemindersView> => unwrap(await apiClient.GET('/reminders', { signal }))
    });
}
