import type { ReactElement } from 'react';
import { Check, PieChart } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ONBOARDING_DESTINATIONS } from '@/app/onboarding-destinations';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useFinishOnboarding } from '../api/use-finish-onboarding.mutation';
import { useOnboardingSummary } from '../api/use-onboarding-summary.query';
import { isConfigured, landingDestination } from '../lib/landing-destination';
import { useLeaveOnboarding, type LeaveOnboarding } from '../lib/use-leave-onboarding';
import { useOnboardingRunner, type RunOnboarding } from '../lib/use-onboarding-runner';
import type { OnboardingSummary } from '../types';
import { StepHeading } from './step-heading';
import { SummaryRows } from './summary-rows';

function SummaryBody({
    summary,
    failed,
    onRetry
}: {
    readonly summary: OnboardingSummary | undefined;
    readonly failed: boolean;
    readonly onRetry: () => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    if (failed) {
        return (
            <Alert
                title={t('summaryErrorTitle')}
                detail={t('summaryErrorDetail')}
                action={
                    <button type="button" onClick={onRetry} className="underline">
                        {t('retry')}
                    </button>
                }
            />
        );
    }
    if (summary === undefined) {
        return (
            <Loading label={t('summaryLoading')} className="grid gap-3">
                <Skeleton className="h-[72px]" />
                <Skeleton className="h-[72px]" />
            </Loading>
        );
    }
    return <SummaryRows summary={summary} />;
}

function FinishButton({ summary }: { readonly summary: OnboardingSummary | undefined }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const finish: ReturnType<typeof useFinishOnboarding> = useFinishOnboarding();
    const leave: LeaveOnboarding = useLeaveOnboarding();
    const run: RunOnboarding = useOnboardingRunner();

    return (
        <Button
            size="lg"
            className="mt-6"
            loading={finish.isPending}
            onClick={(): void => {
                void run(
                    async () => finish.mutateAsync(),
                    async (state) => leave(state, landingDestination(summary, ONBOARDING_DESTINATIONS))
                );
            }}
        >
            <PieChart className="size-4" aria-hidden="true" />
            {t('goToDashboard')}
        </Button>
    );
}

export function DoneScreen(): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const query: ReturnType<typeof useOnboardingSummary> = useOnboardingSummary();
    const ready: boolean = isConfigured(query.data);

    return (
        <div className="mt-5 flex w-[min(720px,100%)] flex-col items-center text-center">
            <span
                aria-hidden="true"
                className="mb-1.5 grid size-[84px] place-items-center rounded-3xl bg-accent text-accent-contrast shadow-popover"
            >
                <Check className="size-10" />
            </span>
            <StepHeading>{ready ? t('doneTitleReady') : t('doneTitleStart')}</StepHeading>
            <p className="mb-6 max-w-[54ch] text-base leading-relaxed text-content-muted">
                {ready ? t('doneLeadReady') : t('doneLeadStart')}
            </p>
            <section aria-label={t('summaryLabel')} className="w-full text-left">
                <SummaryBody
                    summary={query.data}
                    failed={query.isError}
                    onRetry={(): void => {
                        void query.refetch();
                    }}
                />
            </section>
            <FinishButton summary={query.data} />
        </div>
    );
}
