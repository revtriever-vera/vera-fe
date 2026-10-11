import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { WORK_STEP_COUNT } from '../lib/onboarding-progress';
import { StepHeading } from './step-heading';

export interface StepSlotProps {
    readonly step: 'assets' | 'banks';
    readonly nextTo: string;
}

interface StepCopy {
    readonly title: 'assetsStepTitle' | 'banksStepTitle';
    readonly description: 'assetsStepDescription' | 'banksStepDescription';
    readonly current: number;
}

const COPY: Readonly<Record<StepSlotProps['step'], StepCopy>> = {
    assets: { title: 'assetsStepTitle', description: 'assetsStepDescription', current: 1 },
    banks: { title: 'banksStepTitle', description: 'banksStepDescription', current: 2 }
};

export function StepSlot({ step, nextTo }: StepSlotProps): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const copy: StepCopy = COPY[step];

    return (
        <div className="mt-3 flex w-[min(720px,100%)] flex-col gap-4">
            <span className="text-xs font-bold tracking-[0.07em] text-accent-strong uppercase">
                {t('stepEyebrow', { current: copy.current, total: WORK_STEP_COUNT })}
            </span>
            <div>
                <StepHeading>{t(copy.title)}</StepHeading>
                <p className="max-w-[54ch] text-base leading-relaxed text-content-muted">{t(copy.description)}</p>
            </div>
            <Card className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-content-muted">{t('stepPlaceholder')}</p>
                <Link
                    to={nextTo}
                    className="inline-flex h-9 items-center rounded-control bg-accent-strong px-3.5 text-sm font-semibold text-accent-contrast hover:opacity-90"
                >
                    {t('stepContinue')}
                </Link>
            </Card>
        </div>
    );
}
