import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { OnboardingState } from '../types';
import { onboardingKeys } from './onboarding-keys';

export interface OnboardingCache {
    readonly apply: (state: OnboardingState) => void;
    readonly exitTo: (path: string) => void;
    readonly exitPath: () => string | undefined;
    readonly reload: () => Promise<OnboardingState>;
}

export function useOnboardingCache(): OnboardingCache {
    const queryClient: QueryClient = useQueryClient();
    return {
        apply: (state: OnboardingState): void => {
            queryClient.setQueryData(onboardingKeys.state(), state);
        },
        exitTo: (path: string): void => {
            queryClient.setQueryData(onboardingKeys.exit(), path);
        },
        exitPath: (): string | undefined => queryClient.getQueryData<string>(onboardingKeys.exit()),
        reload: async (): Promise<OnboardingState> =>
            queryClient.query({
                queryKey: onboardingKeys.state(),
                queryFn: async ({ signal }): Promise<OnboardingState> => unwrap(await apiClient.GET('/onboarding', { signal })),
                staleTime: 0
            })
    };
}
