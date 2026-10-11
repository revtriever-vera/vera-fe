export interface OnboardingDestinations {
    readonly overview: string;
    readonly assets: string;
    readonly connections: string;
    readonly target: string;
    readonly spending: string;
}

export const ONBOARDING_DESTINATIONS: OnboardingDestinations = {
    overview: '/patrimonio',
    assets: '/patrimonio/ativos',
    connections: '/',
    target: '/patrimonio/carteira-alvo',
    spending: '/'
};
