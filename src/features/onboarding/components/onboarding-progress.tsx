import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Stepper, type StepperStep } from '@/shared/ui/stepper';
import { WORK_STEP_COUNT, type OnboardingProgress } from '../lib/onboarding-progress';
import { PROGRESS_STEP_KEYS, type ProgressStepKey } from '../types';

const LABEL_KEYS: Readonly<Record<ProgressStepKey, 'stepWelcome' | 'stepAssets' | 'stepSpending' | 'stepDone'>> = {
    welcome: 'stepWelcome',
    assets: 'stepAssets',
    banks: 'stepSpending',
    done: 'stepDone'
};

export function OnboardingProgressBar({ progress }: { readonly progress: OnboardingProgress }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const steps: readonly StepperStep[] = PROGRESS_STEP_KEYS.map((key: ProgressStepKey, index: number): StepperStep => ({
        label: t(LABEL_KEYS[key]),
        skipped: progress.skipped[index] === true
    }));
    const current: number = Math.min(progress.activeIndex, WORK_STEP_COUNT);

    return (
        <>
            <div className="hidden w-[min(560px,100%)] min-[861px]:block">
                <Stepper label={t('progressLabel')} steps={steps} activeIndex={progress.activeIndex} />
            </div>
            <div
                role="progressbar"
                aria-label={t('progressLabel')}
                aria-valuemin={1}
                aria-valuemax={WORK_STEP_COUNT}
                aria-valuenow={current}
                aria-valuetext={t('compactProgress', { current, total: WORK_STEP_COUNT })}
                className="flex w-full flex-col gap-1.5 min-[861px]:hidden"
            >
                <span className="text-xs font-semibold text-content-muted">
                    {t('compactProgress', { current, total: WORK_STEP_COUNT })}
                </span>
                <span className="h-1 w-full overflow-hidden rounded-full bg-border">
                    <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${String((current / WORK_STEP_COUNT) * 100)}%` }}
                    />
                </span>
            </div>
        </>
    );
}
