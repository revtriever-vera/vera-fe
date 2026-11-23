import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { EmergencySuggestion } from '../types';
import { goalsKeys } from './goals-keys';

export function useEmergencySuggestion(months: number, enabled: boolean): UseQueryResult<EmergencySuggestion> {
    return useQuery({
        queryKey: goalsKeys.suggestion(months),
        enabled,
        queryFn: async ({ signal }): Promise<EmergencySuggestion> =>
            unwrap(await apiClient.GET('/goals/emergency-suggestion', { params: { query: { months } }, signal }))
    });
}
