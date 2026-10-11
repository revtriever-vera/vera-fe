import { ONBOARDING_PATHS, type OnboardingState, type OnboardingStepKey, type StepVisualStatus } from '../types';

export const WORK_STEP_COUNT: number = 2;

export interface OnboardingProgress {
    readonly activeIndex: number;
    readonly skipped: readonly boolean[];
}

const INDEX_BY_PATH: Readonly<Record<string, number>> = {
    [ONBOARDING_PATHS.assets]: 1,
    [ONBOARDING_PATHS.banks]: 2,
    [ONBOARDING_PATHS.done]: 3
};

export function stepStatus(state: OnboardingState, key: OnboardingStepKey): StepVisualStatus {
    const step: OnboardingState['steps'][OnboardingStepKey] = state.steps[key];
    if (step.doneAt !== null) {
        return 'done';
    }
    return step.skippedAt === null ? 'pending' : 'skipped';
}

export function progressIndexOf(pathname: string): number {
    return INDEX_BY_PATH[pathname.replace(/\/+$/, '')] ?? 0;
}

export function onboardingProgress(state: OnboardingState | undefined, pathname: string): OnboardingProgress {
    const skipped: readonly boolean[] = [
        false,
        state !== undefined && stepStatus(state, 'assets') === 'skipped',
        state !== undefined && stepStatus(state, 'banks') === 'skipped',
        false
    ];
    return { activeIndex: progressIndexOf(pathname), skipped };
}

export function showsProgress(pathname: string): boolean {
    const index: number = progressIndexOf(pathname);
    return index > 0 && index <= WORK_STEP_COUNT;
}
