import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { StartView } from '../types';

export function useCalendarStart(): UseMutationResult<StartView, Error, void> {
    return useMutation({
        mutationFn: async (): Promise<StartView> => unwrap(await apiClient.GET('/calendar/google/start'))
    });
}
