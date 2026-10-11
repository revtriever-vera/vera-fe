import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { OnboardingState, OnboardingStepKey } from '../types';
import { onboardingKeys } from './onboarding-keys';

export function useCompleteStep(): UseMutationResult<OnboardingState, ApiError, OnboardingStepKey> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (step: OnboardingStepKey): Promise<OnboardingState> =>
            unwrap(await apiClient.POST('/onboarding/steps/{step}/complete', { params: { path: { step } } })),
        onSuccess: (state: OnboardingState): void => {
            queryClient.setQueryData(onboardingKeys.state(), state);
            void queryClient.invalidateQueries({ queryKey: onboardingKeys.summary() });
        }
    });
}
