export const onboardingKeys: {
    all: readonly ['onboarding'];
    state: () => readonly ['onboarding', 'state'];
    summary: () => readonly ['onboarding', 'summary'];
    exit: () => readonly ['onboarding', 'exit'];
} = {
    all: ['onboarding'] as const,
    state: (): readonly ['onboarding', 'state'] => [...onboardingKeys.all, 'state'] as const,
    summary: (): readonly ['onboarding', 'summary'] => [...onboardingKeys.all, 'summary'] as const,
    exit: (): readonly ['onboarding', 'exit'] => [...onboardingKeys.all, 'exit'] as const
};
