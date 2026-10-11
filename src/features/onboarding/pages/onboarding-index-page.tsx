import type { ReactElement } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useOnboardingState } from '../api/use-onboarding-state.query';
import { WelcomeScreen } from '../components/welcome-screen';
import { ONBOARDING_PATHS, type OnboardingStatus } from '../types';

const RESUME_PATHS: Readonly<Partial<Record<OnboardingStatus, string>>> = {
    assets: ONBOARDING_PATHS.assets,
    banks: ONBOARDING_PATHS.banks,
    summary: ONBOARDING_PATHS.done
};

export function OnboardingIndexPage(): ReactElement | null {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const { data, isError, refetch } = useOnboardingState();
    if (isError) {
        return (
            <Alert
                title={t('loadErrorTitle')}
                detail={t('loadErrorDetail')}
                action={
                    <button
                        type="button"
                        onClick={(): void => {
                            void refetch();
                        }}
                        className="underline"
                    >
                        {t('retry')}
                    </button>
                }
            />
        );
    }
    if (data === undefined) {
        return (
            <Loading label={t('summaryLoading')} className="w-[min(720px,100%)]">
                <Skeleton className="h-40" />
            </Loading>
        );
    }
    const resume: string | undefined = RESUME_PATHS[data.status];
    if (resume !== undefined) {
        return <Navigate to={resume} replace />;
    }
    return data.status === 'welcome' ? <WelcomeScreen sampleAvailable={data.sample.available} /> : null;
}
