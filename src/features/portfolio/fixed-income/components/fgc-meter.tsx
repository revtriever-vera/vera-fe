import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { FgcCoverage } from '../types';

const FULL_BPS: number = 10000;

export function FgcMeter({ coverage }: { readonly coverage: FgcCoverage }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const locale: SupportedLocale = useLocale();
    const covered: string = formatCurrency(coverage.coveredMinor, coverage.currency, locale);
    const cap: string = formatCurrency(coverage.capMinor, coverage.currency, locale);
    const over: boolean = coverage.capShareBps > FULL_BPS;
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="text-content-muted">{t('fgc.meterLabel')}</span>
                <span className="numeric">{t('fgc.meterValue', { covered, cap })}</span>
            </div>
            <div
                role="meter"
                aria-label={t('fgc.meterLabel')}
                aria-valuemin={0}
                aria-valuemax={coverage.capMinor}
                aria-valuenow={coverage.coveredMinor}
                aria-valuetext={t('fgc.meterValue', { covered, cap })}
                className="h-2 overflow-hidden rounded-control bg-surface-muted"
            >
                <div
                    className={cn('h-full rounded-control', over ? 'bg-critical' : 'bg-accent')}
                    style={{ width: `${Math.min(coverage.capShareBps, FULL_BPS) / 100}%` }}
                />
            </div>
        </div>
    );
}
