import type { ReactElement } from 'react';
import { CalendarClock, CalendarRange, Repeat, Receipt } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { KpiTile } from '@/shared/ui/kpi';
import { RECURRING_CURRENCY, type RecurringTotals } from '../types';

export function RecurringKpis({ totals }: { readonly totals: RecurringTotals }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    const money = (minor: number): string => formatCurrency(minor, RECURRING_CURRENCY, locale);
    const { suggestions } = totals;
    return (
        <div className="flex flex-col gap-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KpiTile
                    label={t('kpis.monthly')}
                    value={money(totals.monthlyMinor)}
                    support={t('kpis.monthlySupport')}
                    icon={CalendarClock}
                />
                <KpiTile label={t('kpis.yearly')} value={money(totals.yearlyMinor)} icon={CalendarRange} />
                <KpiTile label={t('kpis.subscriptions')} value={money(totals.byKind.subscription)} icon={Repeat} />
                <KpiTile label={t('kpis.bills')} value={money(totals.byKind.bill)} icon={Receipt} />
            </div>
            {suggestions.count > 0 ? (
                <p className="text-sm text-content-muted">
                    {t('kpis.suggestions', { count: suggestions.count, amount: money(suggestions.monthlyMinor) })}
                </p>
            ) : null}
        </div>
    );
}
