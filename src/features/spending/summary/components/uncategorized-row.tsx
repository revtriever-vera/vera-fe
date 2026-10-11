import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { CategoryTile } from '../../components/category-tile';
import { BAR_FILL } from '../lib/bar-colors';
import { widthPercent } from '../lib/bar-scale';
import { BarTrack } from './bar-track';

export interface UncategorizedRowProps {
    readonly valueMinor: number;
    readonly count: number;
    readonly scale: number;
    readonly month: string;
    readonly currency: string;
}

function UncategorizedTooltip({ valueMinor, count, month, currency }: Omit<UncategorizedRowProps, 'scale'>): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const { t: tSpending }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{tSpending('categories.uncategorized')}</span>
            <span>{t('tooltip.spent', { value: formatCurrency(valueMinor, currency, locale) })}</span>
            <span>{t('tooltip.transactions', { count })}</span>
            <Link
                to="/spending/transactions"
                search={{ month, uncategorized: true }}
                className="w-fit font-semibold underline underline-offset-2"
            >
                {t('bars.categorize')}
            </Link>
        </div>
    );
}

export function UncategorizedRow(props: UncategorizedRowProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const { t: tSpending }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const locale: SupportedLocale = useLocale();
    const spent: string = formatCurrency(props.valueMinor, props.currency, locale);
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <CategoryTile category={null} size="sm" />
                <span className="min-w-0 flex-1 text-sm font-semibold break-words">{tSpending('categories.uncategorized')}</span>
                <Link
                    to="/spending/transactions"
                    search={{ month: props.month, uncategorized: true }}
                    className="text-sm font-semibold text-accent-strong underline underline-offset-2"
                >
                    {t('bars.categorize')}
                </Link>
                <span className="numeric text-sm font-semibold">{spent}</span>
            </div>
            <BarTrack
                label={t('bars.uncategorizedTrackLabel', { spent })}
                fillClass={BAR_FILL.uncategorized}
                valuePercent={widthPercent(props.valueMinor, props.scale)}
                averagePercent={null}
                tooltip={<UncategorizedTooltip {...props} />}
            />
        </div>
    );
}
