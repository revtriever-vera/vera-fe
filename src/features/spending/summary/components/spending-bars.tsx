import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { formatDeltaBps } from '../../lib/format-bps';
import { useCategoryLabel, type CategoryLabel } from '../../lib/use-category-label';
import { FLEXIBILITY, type MonthlySummary, type SummaryCategoryRow } from '../../types';
import { AVERAGE_WINDOW_MONTHS } from '../lib/average-window';
import { barScale } from '../lib/bar-scale';
import { BarsLegend } from './bars-legend';
import { SpendingBarRow } from './spending-bar-row';
import { FixedNote } from './summary-notes';
import { UncategorizedRow } from './uncategorized-row';

export interface SpendingBarsProps {
    readonly summary: MonthlySummary;
}

function rowSentence(
    t: ReturnType<typeof useTranslation<'spendingSummary'>>['t'],
    row: SummaryCategoryRow,
    parts: {
        readonly name: string;
        readonly kind: string;
        readonly spent: string;
        readonly average: string;
        readonly delta: string;
    }
): string {
    if (row.isNew) {
        return t('list.itemNew', parts);
    }
    return row.averageMinor === null || row.deltaBps === null ? t('list.itemPlain', parts) : t('list.item', parts);
}

function TextRow({ row, summary }: { readonly row: SummaryCategoryRow; readonly summary: MonthlySummary }): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const { t: tSpending }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const locale: SupportedLocale = useLocale();
    const label: CategoryLabel = useCategoryLabel();
    const money = (minor: number): string => formatCurrency(minor, summary.currency, locale);
    const sentence: string = rowSentence(t, row, {
        name: label(row),
        kind: tSpending(`categories.flexibility.${row.flexibility === FLEXIBILITY.flexible ? FLEXIBILITY.flexible : FLEXIBILITY.fixed}`),
        spent: money(row.spentMinor),
        average: money(row.averageMinor ?? 0),
        delta: formatDeltaBps(row.deltaBps ?? 0, locale)
    });
    return (
        <li>
            {sentence}{' '}
            <Link to="/spending/transactions" search={{ month: summary.month, categoryId: row.categoryId }}>
                {t('list.transactions', { name: label(row) })}
            </Link>
        </li>
    );
}

function TextAlternative({ summary }: SpendingBarsProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const locale: SupportedLocale = useLocale();
    return (
        <ul aria-label={t('list.label')} className="sr-only">
            {summary.categories.map((row: SummaryCategoryRow): ReactElement => (
                <TextRow key={row.categoryId} row={row} summary={summary} />
            ))}
            {summary.uncategorizedMinor > 0 ? (
                <li>
                    {t('list.uncategorized', { spent: formatCurrency(summary.uncategorizedMinor, summary.currency, locale) })}{' '}
                    <Link to="/spending/transactions" search={{ month: summary.month, uncategorized: true }}>
                        {t('list.uncategorizedTransactions')}
                    </Link>
                </li>
            ) : null}
        </ul>
    );
}

export function SpendingBars({ summary }: SpendingBarsProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const scale: number = barScale(summary.categories, summary.uncategorizedMinor);
    return (
        <Card className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold">{t('bars.title')}</h3>
                <p className="text-sm text-content-muted">{t('bars.hint', { months: AVERAGE_WINDOW_MONTHS })}</p>
            </div>
            <div className="flex flex-col gap-4">
                {summary.categories.map((row: SummaryCategoryRow): ReactElement => (
                    <SpendingBarRow
                        key={row.categoryId}
                        row={row}
                        scale={scale}
                        month={summary.month}
                        currency={summary.currency}
                        averageMonths={summary.averageMonths}
                    />
                ))}
                {summary.uncategorizedMinor > 0 ? (
                    <UncategorizedRow
                        valueMinor={summary.uncategorizedMinor}
                        count={summary.uncategorizedCount}
                        scale={scale}
                        month={summary.month}
                        currency={summary.currency}
                    />
                ) : null}
            </div>
            <TextAlternative summary={summary} />
            <BarsLegend />
            <FixedNote summary={summary} />
        </Card>
    );
}
