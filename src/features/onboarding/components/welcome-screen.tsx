import type { ReactElement } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { ArrowRight, Plug, Sparkles, Wallet } from 'lucide-react';
import { Trans, useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ONBOARDING_DESTINATIONS } from '@/app/onboarding-destinations';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { Button } from '@/shared/ui/button';
import { useLoadSample } from '../api/use-load-sample.mutation';
import { useStartOnboarding } from '../api/use-start-onboarding.mutation';
import { useLeaveOnboarding, type LeaveOnboarding } from '../lib/use-leave-onboarding';
import { useOnboardingRunner, type RunOnboarding } from '../lib/use-onboarding-runner';
import { useTrackStepViewed } from '../lib/use-track-step-viewed';
import { ONBOARDING_PATHS } from '../types';
import { PathCard } from './path-card';
import { StepHeading } from './step-heading';

const WELCOME_SCREEN: string = 'onboarding';

export interface WelcomeScreenProps {
    readonly sampleAvailable: boolean;
}

function WelcomeCopy(): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    return (
        <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-soft bg-surface px-2.5 py-1 text-[11.5px] font-bold tracking-[0.07em] text-accent-strong uppercase">
                <Sparkles className="size-3.5" aria-hidden="true" />
                {t('welcomeEyebrow')}
            </span>
            <StepHeading>
                <Trans i18nKey="welcomeTitle" ns="onboarding" components={{ accent: <em className="text-accent not-italic" /> }} />
            </StepHeading>
            <p className="mb-5 max-w-[54ch] text-base leading-relaxed text-content-muted">{t('welcomeLeadQuestions')}</p>
            <p className="max-w-[54ch] text-base leading-relaxed text-content-muted">
                <Trans i18nKey="welcomeLeadOptional" ns="onboarding" components={{ strong: <b className="text-content" /> }} />
            </p>
        </div>
    );
}

function SampleButton(): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const toast: ToastApi = useToast();
    const sample: ReturnType<typeof useLoadSample> = useLoadSample();
    const leave: LeaveOnboarding = useLeaveOnboarding();
    const run: RunOnboarding = useOnboardingRunner();

    return (
        <Button
            variant="ghost"
            loading={sample.isPending}
            onClick={(): void => {
                void run(
                    async () => sample.mutateAsync(),
                    async (state) => {
                        track('sample_data_loaded', { source: 'welcome', screen: WELCOME_SCREEN });
                        toast.show({ tone: 'positive', title: t('sampleLoaded') });
                        await leave(state, ONBOARDING_DESTINATIONS.overview);
                    }
                );
            }}
        >
            <Sparkles className="size-4" aria-hidden="true" />
            {t('sampleAction')}
        </Button>
    );
}

function StartButton(): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const navigate: UseNavigateResult<string> = useNavigate();
    const start: ReturnType<typeof useStartOnboarding> = useStartOnboarding();
    const run: RunOnboarding = useOnboardingRunner();

    return (
        <Button
            size="lg"
            loading={start.isPending}
            onClick={(): void => {
                void run(
                    async () => start.mutateAsync(),
                    async () => {
                        track('onboarding_started');
                        await navigate({ to: ONBOARDING_PATHS.assets });
                    }
                );
            }}
        >
            {t('startAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
    );
}

export function WelcomeScreen({ sampleAvailable }: WelcomeScreenProps): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    useTrackStepViewed('welcome');

    return (
        <div className="mt-3 grid w-[min(1100px,100%)] items-start gap-8 min-[861px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <WelcomeCopy />
            <div className="grid gap-3">
                <PathCard
                    icon={Wallet}
                    tone="accent"
                    title={t('pathAssetsTitle')}
                    description={t('pathAssetsDescription')}
                    time={t('pathAssetsTime')}
                />
                <PathCard
                    icon={Plug}
                    tone="caution"
                    title={t('pathBanksTitle')}
                    description={t('pathBanksDescription')}
                    time={t('pathBanksTime')}
                />
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                    {sampleAvailable ? <SampleButton /> : <span />}
                    <StartButton />
                </div>
            </div>
        </div>
    );
}
