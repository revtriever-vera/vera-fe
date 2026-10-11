import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { buttonVariants } from '@/shared/ui/button';
import { MonthSwitcher } from '../../components/month-switcher';
import { formatRateBps } from '../../lib/format-bps';
import type { MonthlySummary } from '../../types';
import { headlineOf, type Headline } from '../lib/summary-headline';

export interface SummaryHeaderProps {
    readonly summary: MonthlySummary;
    readonly onMonthChange: (month: string) => void;
}

function useHeadlineText(summary: MonthlySummary): string {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const locale: SupportedLocale = useLocale();
    const headline: Headline = headlineOf(summary);
    if (headline === 'no_income') {
        return t('header.noIncome');
    }
    if (headline === 'overspent') {
        return t('header.overspent', { amount: formatCurrency(-summary.savedMinor, summary.currency, locale) });
    }
    return t('header.saved', {
        rate: formatRateBps(summary.savingsRateBps ?? 0, locale),
        goal: formatRateBps(summary.goal.bps, locale)
    });
}

export function SummaryHeader({ summary, onMonthChange }: SummaryHeaderProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const headline: string = useHeadlineText(summary);
    return (
        <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <MonthSwitcher
                    month={summary.month}
                    previousMonth={summary.previousMonth}
                    nextMonth={summary.nextMonth}
                    isPartial={summary.isPartial}
                    onChange={onMonthChange}
                />
                <Link to="/spending/cuts" search={{ month: summary.month }} className={buttonVariants({ variant: 'secondary' })}>
                    {t('header.cuts')}
                </Link>
            </div>
            <p className="text-base font-semibold">{headline}</p>
            {summary.isPartial ? <p className="text-sm text-content-muted">{t('header.partialNote')}</p> : null}
        </header>
    );
}
