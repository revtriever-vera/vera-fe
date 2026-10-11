import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useOnboardingCache, type OnboardingCache } from '../api/use-apply-onboarding-state';
import { HOME_PATH, type OnboardingState } from '../types';
import { isAlreadyClosed, onboardingErrorMessage } from './onboarding-error-message';
import { useLeaveOnboarding, type LeaveOnboarding } from './use-leave-onboarding';

export type RunOnboarding = (action: () => Promise<OnboardingState>, onSuccess: (state: OnboardingState) => Promise<void>) => Promise<void>;

export function useOnboardingRunner(): RunOnboarding {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const toast: ToastApi = useToast();
    const cache: OnboardingCache = useOnboardingCache();
    const leave: LeaveOnboarding = useLeaveOnboarding();
    const navigate: UseNavigateResult<string> = useNavigate();

    async function recover(error: unknown): Promise<void> {
        const failure: Error = error instanceof Error ? error : new Error('unknown');
        if (!isAlreadyClosed(failure)) {
            toast.show({ tone: 'critical', title: onboardingErrorMessage(t, failure) });
            return;
        }
        try {
            await leave(await cache.reload(), HOME_PATH);
        } catch {
            await navigate({ to: HOME_PATH });
        }
    }

    return async (action, onSuccess): Promise<void> => {
        try {
            await onSuccess(await action());
        } catch (error) {
            await recover(error);
        }
    };
}
