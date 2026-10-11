import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { OnboardingState } from '../types';
import { onboardingKeys } from './onboarding-keys';

const OPEN_STALE_TIME_MS: number = 30_000;

export function useOnboardingState(): UseQueryResult<OnboardingState> {
    return useQuery({
        queryKey: onboardingKeys.state(),
        queryFn: async ({ signal }): Promise<OnboardingState> => unwrap(await apiClient.GET('/onboarding', { signal })),
        staleTime: (query): number => (query.state.data?.status === 'closed' ? Infinity : OPEN_STALE_TIME_MS),
        retry: false,
        retryOnMount: false,
        refetchOnWindowFocus: false
    });
}
