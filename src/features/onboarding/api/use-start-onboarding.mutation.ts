import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { OnboardingState } from '../types';
import { onboardingKeys } from './onboarding-keys';

export function useStartOnboarding(): UseMutationResult<OnboardingState, ApiError, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<OnboardingState> => unwrap(await apiClient.POST('/onboarding/start')),
        onSuccess: (state: OnboardingState): void => {
            queryClient.setQueryData(onboardingKeys.state(), state);
        }
    });
}
