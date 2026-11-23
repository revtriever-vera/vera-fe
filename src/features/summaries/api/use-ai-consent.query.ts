import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ConsentState } from '../types';
import { aiKeys } from './ai-keys';

export function useAiConsent(enabled: boolean = true): UseQueryResult<ConsentState> {
    return useQuery({
        queryKey: aiKeys.consent(),
        queryFn: async ({ signal }): Promise<ConsentState> => unwrap(await apiClient.GET('/ai/consent', { signal })),
        enabled
    });
}
