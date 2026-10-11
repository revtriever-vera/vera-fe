import { ONBOARDING_PATHS, type OnboardingState, type OnboardingStepKey } from '../types';
import { stepStatus } from './onboarding-progress';

export function nextStepRoute(state: OnboardingState, step: OnboardingStepKey): string {
    if (step === 'assets' && stepStatus(state, 'banks') === 'pending') {
        return ONBOARDING_PATHS.banks;
    }
    return ONBOARDING_PATHS.done;
}
