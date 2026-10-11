import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { useUpdatePortfolioSettings } from '../../api/use-portfolio-settings.mutation';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import type { PortfolioSettings, UpdatePortfolioSettings } from '../../types';
import { PercentStepper } from './percent-stepper';
import { ToleranceExample } from './tolerance-example';

export interface ToleranceCardProps {
    readonly toleranceBps: number;
}

const STEP_BPS: number = 50;
const MAX_TOLERANCE_BPS: number = 2000;
const BPS_PER_POINT: number = 100;

interface ToleranceControl {
    readonly draft: number;
    readonly setDraft: (bps: number) => void;
    readonly commit: (bps: number) => void;
    readonly pending: boolean;
}

function useToleranceControl(toleranceBps: number): ToleranceControl {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const locale: SupportedLocale = useLocale();
    const toast: ToastApi = useToast();
    const update: UseMutationResult<PortfolioSettings, ApiError, UpdatePortfolioSettings> = useUpdatePortfolioSettings();
    const [draft, setDraft] = useState<number>(toleranceBps);
    const commit = (next: number): void => {
        if (next === toleranceBps) {
            return;
        }
        const tolerance: string = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(next / BPS_PER_POINT);
        update.mutate(
            { toleranceBps: next },
            {
                onSuccess: (): void => {
                    track('portfolio_tolerance_changed');
                    toast.show({ tone: 'positive', title: t('tolerance.saved', { tolerance }) });
                },
                onError: (error: Error): void => {
                    setDraft(toleranceBps);
                    toast.show({ tone: 'critical', title: t('tolerance.saveFailed'), detail: portfolioErrorMessage(tp, error) });
                }
            }
        );
    };
    return { draft, setDraft, commit, pending: update.isPending };
}

export function ToleranceCard({ toleranceBps }: ToleranceCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const control: ToleranceControl = useToleranceControl(toleranceBps);
    const invalid: boolean = !Number.isFinite(control.draft);
    return (
        <Card className="flex flex-col gap-4">
            <div>
                <h3 className="text-base font-semibold">{t('tolerance.title')}</h3>
                <p className="text-sm text-content-muted">{t('tolerance.description')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <PercentStepper
                    value={control.draft}
                    onChange={control.setDraft}
                    onCommit={control.commit}
                    stepBps={STEP_BPS}
                    minBps={0}
                    maxBps={MAX_TOLERANCE_BPS}
                    inputLabel={t('tolerance.inputLabel')}
                    decreaseLabel={t('tolerance.decrease')}
                    increaseLabel={t('tolerance.increase')}
                    error={invalid ? t('tolerance.invalid') : undefined}
                    disabled={control.pending}
                />
                <span className="text-sm text-content-muted">{t('tolerance.unit')}</span>
            </div>
            <ToleranceExample toleranceBps={invalid ? toleranceBps : control.draft} />
        </Card>
    );
}
