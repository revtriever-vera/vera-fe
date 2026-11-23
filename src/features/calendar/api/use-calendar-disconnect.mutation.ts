import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import { calendarKeys } from './calendar-keys';

export function useCalendarDisconnect(): UseMutationResult<void, Error, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<void> => {
            unwrapEmpty(await apiClient.DELETE('/calendar/connection'));
        },
        onSuccess: async (): Promise<void> => {
            queryClient.removeQueries({ queryKey: calendarKeys.events() });
            await queryClient.invalidateQueries({ queryKey: calendarKeys.connection() });
        }
    });
}
