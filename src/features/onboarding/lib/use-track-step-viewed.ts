import { useEffect } from 'react';
import { track } from '@/shared/lib/analytics';
import type { OnboardingStepName } from '@/shared/lib/analytics/events';

export function useTrackStepViewed(step: OnboardingStepName): void {
    useEffect((): void => {
        track('onboarding_step_viewed', { step });
    }, [step]);
}
