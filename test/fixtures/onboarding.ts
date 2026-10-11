import type { OnboardingState, OnboardingSummary } from '@/features/onboarding/types';

export function onboardingState(overrides: Partial<OnboardingState> = {}): OnboardingState {
    return {
        status: 'welcome',
        startedAt: null,
        steps: {
            assets: { doneAt: null, skippedAt: null },
            banks: { doneAt: null, skippedAt: null }
        },
        completedAt: null,
        dismissedAt: null,
        sample: { active: false, available: false },
        ...overrides
    };
}

export function closedState(overrides: Partial<OnboardingState> = {}): OnboardingState {
    return onboardingState({ status: 'closed', dismissedAt: '2026-10-01T12:00:00.000Z', ...overrides });
}

export function onboardingSummary(overrides: Partial<OnboardingSummary> = {}): OnboardingSummary {
    return { assets: null, banks: null, target: null, ...overrides };
}
