import type { OnboardingStepName } from '@/shared/lib/analytics/events';
import { ONBOARDING_PATHS } from '../types';

export function stepOfPath(pathname: string): OnboardingStepName {
    if (pathname.startsWith(ONBOARDING_PATHS.assets)) {
        return 'assets';
    }
    if (pathname.startsWith(ONBOARDING_PATHS.banks)) {
        return 'banks';
    }
    return pathname.startsWith(ONBOARDING_PATHS.done) ? 'done' : 'welcome';
}
