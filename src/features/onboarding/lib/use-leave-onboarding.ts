import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useOnboardingCache, type OnboardingCache } from '../api/use-apply-onboarding-state';
import type { OnboardingState } from '../types';

export type LeaveOnboarding = (state: OnboardingState, to: string) => Promise<void>;

export function useLeaveOnboarding(): LeaveOnboarding {
    const navigate: UseNavigateResult<string> = useNavigate();
    const cache: OnboardingCache = useOnboardingCache();
    return async (state: OnboardingState, to: string): Promise<void> => {
        cache.exitTo(to);
        cache.apply(state);
        await navigate({ to });
    };
}
