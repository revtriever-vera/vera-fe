import type { paths } from '@/shared/lib/api/schema';

export type OnboardingState = paths['/onboarding']['get']['responses']['200']['content']['application/json'];
export type OnboardingSummary = paths['/onboarding/summary']['get']['responses']['200']['content']['application/json'];
export type OnboardingStatus = OnboardingState['status'];
export type OnboardingStepKey = keyof OnboardingState['steps'];
export type OnboardingStepState = OnboardingState['steps'][OnboardingStepKey];
export type AreaSummary = NonNullable<OnboardingSummary['assets']>;

export type StepVisualStatus = 'done' | 'skipped' | 'pending';

export const ONBOARDING_PATHS = {
    root: '/onboarding',
    assets: '/onboarding/assets',
    banks: '/onboarding/banks',
    done: '/onboarding/done'
} as const;

export const HOME_PATH: string = '/';

export const PROGRESS_STEP_KEYS = ['welcome', 'assets', 'banks', 'done'] as const;

export type ProgressStepKey = (typeof PROGRESS_STEP_KEYS)[number];
