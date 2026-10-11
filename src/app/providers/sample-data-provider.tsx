import { useMemo, type ReactElement, type ReactNode } from 'react';
import { useQueryClient, type Query, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { authKeys } from '@/features/auth/api/auth-keys';
import { useClearSample } from '@/features/onboarding/api/use-clear-sample.mutation';
import { useLoadSample } from '@/features/onboarding/api/use-load-sample.mutation';
import { onboardingKeys } from '@/features/onboarding/api/onboarding-keys';
import { useOnboardingCache, type OnboardingCache } from '@/features/onboarding/api/use-apply-onboarding-state';
import { useOnboardingState } from '@/features/onboarding/api/use-onboarding-state.query';
import { onboardingErrorMessage } from '@/features/onboarding/lib/onboarding-error-message';
import type { OnboardingState } from '@/features/onboarding/types';
import type { ApiError } from '@/shared/lib/api/api-error';
import { SampleDataContext, type SampleDataControls } from '@/shared/lib/sample-data/sample-data-context';
import { useToast, type ToastApi } from './toast-provider';

const PRESERVED_ONBOARDING_SEGMENTS: readonly unknown[] = [onboardingKeys.state()[1], onboardingKeys.exit()[1]];

function isRefreshable(query: Query): boolean {
    const [scope, segment]: readonly unknown[] = query.queryKey;
    if (scope === authKeys.all[0]) {
        return false;
    }
    return !(scope === onboardingKeys.all[0] && PRESERVED_ONBOARDING_SEGMENTS.includes(segment));
}

export function SampleDataProvider({ children }: { readonly children: ReactNode }): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    const { t: tOnboarding }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const toast: ToastApi = useToast();
    const queryClient: QueryClient = useQueryClient();
    const cache: OnboardingCache = useOnboardingCache();
    const state: OnboardingState | undefined = useOnboardingState().data;
    const loadMutation: UseMutationResult<OnboardingState, ApiError, void> = useLoadSample();
    const clearMutation: UseMutationResult<OnboardingState, ApiError, void> = useClearSample();
    const isLoading: boolean = loadMutation.isPending || clearMutation.isPending;

    const value: SampleDataControls = useMemo(() => {
        async function run(action: () => Promise<OnboardingState>, successTitle: string): Promise<void> {
            if (isLoading) {
                return;
            }
            try {
                cache.apply(await action());
                await queryClient.invalidateQueries({ predicate: isRefreshable });
                toast.show({ tone: 'positive', title: successTitle });
            } catch (error) {
                const failure: Error = error instanceof Error ? error : new Error('unknown');
                toast.show({ tone: 'critical', title: onboardingErrorMessage(tOnboarding, failure) });
            }
        }

        return {
            available: state?.sample.available ?? false,
            active: state?.sample.active ?? false,
            isLoading,
            load: async (): Promise<void> => run(async () => loadMutation.mutateAsync(), t('sampleLoaded')),
            clear: async (): Promise<void> => run(async () => clearMutation.mutateAsync(), t('sampleCleared'))
        };
    }, [state, isLoading, cache, queryClient, toast, t, tOnboarding, loadMutation, clearMutation]);

    return <SampleDataContext value={value}>{children}</SampleDataContext>;
}
