import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { OnboardingSummary } from '../types';
import { onboardingKeys } from './onboarding-keys';

export function useOnboardingSummary(): UseQueryResult<OnboardingSummary> {
    return useQuery({
        queryKey: onboardingKeys.summary(),
        queryFn: async ({ signal }): Promise<OnboardingSummary> => unwrap(await apiClient.GET('/onboarding/summary', { signal })),
        staleTime: 0
    });
}
