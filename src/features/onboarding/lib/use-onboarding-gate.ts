import { useRouterState } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useOnboardingCache, type OnboardingCache } from '../api/use-apply-onboarding-state';
import { useOnboardingState } from '../api/use-onboarding-state.query';
import { HOME_PATH, ONBOARDING_PATHS, type OnboardingState } from '../types';

export type OnboardingGate = { readonly kind: 'loading' } | { readonly kind: 'redirect'; readonly to: string } | { readonly kind: 'open' };

function insideOnboarding(pathname: string): boolean {
    return pathname === ONBOARDING_PATHS.root || pathname.startsWith(`${ONBOARDING_PATHS.root}/`);
}

export function decideGate(state: OnboardingState, pathname: string, exitPath: string = HOME_PATH): OnboardingGate {
    if (state.status === 'closed') {
        return insideOnboarding(pathname) ? { kind: 'redirect', to: exitPath } : { kind: 'open' };
    }
    return pathname === HOME_PATH ? { kind: 'redirect', to: ONBOARDING_PATHS.root } : { kind: 'open' };
}

export function useOnboardingGate(): OnboardingGate {
    const pathname: string = useRouterState({ select: (state): string => state.location.pathname });
    const query: UseQueryResult<OnboardingState> = useOnboardingState();
    const cache: OnboardingCache = useOnboardingCache();
    if (query.isError) {
        return { kind: 'open' };
    }
    if (query.data === undefined) {
        return { kind: 'loading' };
    }
    return decideGate(query.data, pathname, cache.exitPath());
}
