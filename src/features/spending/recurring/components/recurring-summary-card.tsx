import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { buttonVariants } from '@/shared/ui/button';
import { useRecurring } from '../api/use-recurring.query';
import { RECURRING_CURRENCY, type RecurringOverview } from '../types';

export function RecurringSummaryCard(): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    const overview: UseQueryResult<RecurringOverview> = useRecurring();
    if (overview.data === undefined) {
        return null;
    }
    const { monthlyMinor, suggestions } = overview.data.totals;
    if (monthlyMinor <= 0 && suggestions.count <= 0) {
        return null;
    }
    const amount: string = formatCurrency(monthlyMinor, RECURRING_CURRENCY, locale);
    return (
        <section aria-labelledby="recurring-summary-title" className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-col gap-1">
                <h2 id="recurring-summary-title" className="text-base font-bold">
                    {t('touchpoints.summaryTitle')}
                </h2>
                <p className="text-sm text-content-muted">
                    {monthlyMinor > 0 ? t('touchpoints.summaryMonthly', { amount }) : t('touchpoints.summaryNoTotal')}
                    {suggestions.count > 0 ? ` · ${t('touchpoints.summaryReview', { count: suggestions.count })}` : ''}
                </p>
            </div>
            <Link to="/spending/recurring" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                {t('touchpoints.summaryLink')}
            </Link>
        </section>
    );
}
