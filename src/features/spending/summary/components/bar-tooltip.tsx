import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatDeltaBps } from '../../lib/format-bps';
import { useCategoryLabel, type CategoryLabel } from '../../lib/use-category-label';
import type { SummaryCategoryRow } from '../../types';
import { AVERAGE_WINDOW_MONTHS } from '../lib/average-window';

export interface BarTooltipProps {
    readonly row: SummaryCategoryRow;
    readonly month: string;
    readonly currency: string;
    readonly averageMonths: number;
}

function AverageLines({ row, currency, averageMonths }: Omit<BarTooltipProps, 'month'>): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const locale: SupportedLocale = useLocale();
    if (row.averageMinor === null) {
        return <span>{t('tooltip.noAverage')}</span>;
    }
    return (
        <>
            <span>{t('tooltip.average', { value: formatCurrency(row.averageMinor, currency, locale) })}</span>
            {averageMonths < AVERAGE_WINDOW_MONTHS ? (
                <span className="text-surface/80">{t('tooltip.averageMonths', { count: averageMonths })}</span>
            ) : null}
        </>
    );
}

export function BarTooltip({ row, month, currency, averageMonths }: BarTooltipProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const locale: SupportedLocale = useLocale();
    const label: CategoryLabel = useCategoryLabel();
    return (
        <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{label(row)}</span>
            <span>{t('tooltip.spent', { value: formatCurrency(row.spentMinor, currency, locale) })}</span>
            <AverageLines row={row} currency={currency} averageMonths={averageMonths} />
            {row.deltaBps === null ? null : <span>{t('tooltip.delta', { delta: formatDeltaBps(row.deltaBps, locale) })}</span>}
            <span>{t('tooltip.transactions', { count: row.transactionCount })}</span>
            <Link
                to="/spending/transactions"
                search={{ month, categoryId: row.categoryId }}
                className="w-fit font-semibold underline underline-offset-2"
            >
                {t('tooltip.viewTransactions')}
            </Link>
        </div>
    );
}
