import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { OnboardingState } from '../types';

export function useDismissOnboarding(): UseMutationResult<OnboardingState, ApiError, void> {
    return useMutation({
        mutationFn: async (): Promise<OnboardingState> => unwrap(await apiClient.POST('/onboarding/dismiss'))
    });
}
