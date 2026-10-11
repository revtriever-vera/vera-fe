export interface OnboardingDestinations {
    readonly overview: string;
    readonly assets: string;
    readonly connections: string;
    readonly target: string;
    readonly spending: string;
}

export const ONBOARDING_DESTINATIONS: OnboardingDestinations = {
    overview: '/portfolio',
    assets: '/portfolio/assets',
    connections: '/',
    target: '/portfolio/targets',
    spending: '/'
};
