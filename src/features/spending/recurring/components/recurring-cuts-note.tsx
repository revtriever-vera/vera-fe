import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useRecurring } from '../api/use-recurring.query';
import { RECURRING_ALERT_KIND, RECURRING_CURRENCY, type RecurringAlert, type RecurringOverview } from '../types';

export function RecurringCutsNote(): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    const overview: UseQueryResult<RecurringOverview> = useRecurring();
    if (overview.data === undefined) {
        return null;
    }
    const subscriptions: number = overview.data.totals.byKind.subscription;
    if (subscriptions <= 0) {
        return null;
    }
    const raised: number = overview.data.alerts.filter(
        (alert: RecurringAlert): boolean => alert.kind === RECURRING_ALERT_KIND.priceIncrease
    ).length;
    const amount: string = formatCurrency(subscriptions, RECURRING_CURRENCY, locale);
    return (
        <p className="text-sm text-content-muted">
            {t('touchpoints.cutsNote', { amount })}
            {raised > 0 ? ` ${t('touchpoints.cutsRaised', { count: raised })}` : ''}{' '}
            <Link to="/spending/recurring" className="font-medium text-accent-strong underline">
                {t('touchpoints.cutsLink')}
            </Link>
        </p>
    );
}
