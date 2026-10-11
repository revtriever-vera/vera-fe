import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { CategoryName } from '../../components/category-name';
import { CategoryTile } from '../../components/category-tile';
import { FlexibilityToggle, type FlexibilityTarget } from '../../components/flexibility-toggle';
import { formatDeltaBps } from '../../lib/format-bps';
import { useCategoryLabel, type CategoryLabel } from '../../lib/use-category-label';
import { CATEGORY_KIND, FLEXIBILITY, type SummaryCategoryRow } from '../../types';
import { widthPercent } from '../lib/bar-scale';
import { BAR_FILL } from '../lib/bar-colors';
import { shouldHighlight } from '../lib/delta-highlight';
import { BarTooltip } from './bar-tooltip';
import { BarTrack } from './bar-track';

export interface SpendingBarRowProps {
    readonly row: SummaryCategoryRow;
    readonly scale: number;
    readonly month: string;
    readonly currency: string;
    readonly averageMonths: number;
}

function RowBadges({ row }: { readonly row: SummaryCategoryRow }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const locale: SupportedLocale = useLocale();
    if (row.isNew) {
        return <Badge tone="neutral">{t('bars.new')}</Badge>;
    }
    if (row.deltaBps !== null && shouldHighlight(row)) {
        return <Badge tone="caution">{t('bars.delta', { delta: formatDeltaBps(row.deltaBps, locale) })}</Badge>;
    }
    return null;
}

export function SpendingBarRow({ row, scale, month, currency, averageMonths }: SpendingBarRowProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const locale: SupportedLocale = useLocale();
    const label: CategoryLabel = useCategoryLabel();
    const target: FlexibilityTarget = {
        id: row.categoryId,
        kind: CATEGORY_KIND.expense,
        flexibility: row.flexibility,
        systemKey: row.systemKey,
        name: row.name
    };
    const spent: string = formatCurrency(row.spentMinor, currency, locale);
    const trackLabel: string =
        row.averageMinor === null
            ? t('bars.trackLabel', { name: label(row), spent })
            : t('bars.trackLabelAverage', { name: label(row), spent, average: formatCurrency(row.averageMinor, currency, locale) });
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <CategoryTile category={{ icon: row.icon, kind: CATEGORY_KIND.expense, flexibility: row.flexibility }} size="sm" />
                <CategoryName category={row} className="min-w-0 flex-1 truncate text-sm font-semibold" />
                <FlexibilityToggle category={target} />
                <span className="flex items-center gap-2">
                    <RowBadges row={row} />
                    <span className="numeric text-sm font-semibold">{spent}</span>
                </span>
            </div>
            <BarTrack
                label={trackLabel}
                fillClass={BAR_FILL[row.flexibility === FLEXIBILITY.flexible ? FLEXIBILITY.flexible : FLEXIBILITY.fixed]}
                valuePercent={widthPercent(row.spentMinor, scale)}
                averagePercent={row.averageMinor === null ? null : widthPercent(row.averageMinor, scale)}
                tooltip={<BarTooltip row={row} month={month} currency={currency} averageMonths={averageMonths} />}
            />
        </div>
    );
}
