import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { formatCurrency } from '@/shared/lib/format/currency';
import type { SupportedLocale } from '@/shared/lib/locale';
import { cn } from '@/shared/lib/cn';
import { IconTile } from '@/shared/ui/icon-tile';
import { Balloon } from '@/shared/ui/tooltip';
import { CategoryName } from '../../components/category-name';
import { categoryIcon } from '../../lib/category-icons';
import { CATEGORY_TONE_CLASSES } from '../../lib/category-tone';
import { MINUS_SIGN } from '../../lib/format-bps';
import { SPENDING_CURRENCY, type CutSuggestion } from '../../types';
import { formatWhole } from '../lib/format-reais';

export const MIN_VISIBLE_CUT_MINOR: number = 100;
export const MIN_AVERAGE_MONTHS: number = 3;

export function CutCategory({ suggestion }: { readonly suggestion: CutSuggestion }): ReactElement {
    return (
        <span className="flex items-center gap-3">
            <IconTile icon={categoryIcon(suggestion.icon)} tone="neutral" size="sm" className={CATEGORY_TONE_CLASSES.flexible} />
            <CategoryName category={suggestion} className="font-semibold" />
        </span>
    );
}

export function WholeAmount({
    minor,
    prefix = '',
    className
}: {
    readonly minor: number;
    readonly prefix?: string;
    readonly className?: string;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    const exact: string = t('table.exact', { amount: formatCurrency(minor, SPENDING_CURRENCY, locale) });
    return (
        <Balloon text={exact}>
            <span className={cn('numeric', className)}>{`${prefix}${formatWhole(minor, locale)}`}</span>
        </Balloon>
    );
}

export function AverageValue({
    suggestion,
    averageMonths
}: {
    readonly suggestion: CutSuggestion;
    readonly averageMonths: number;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    if (suggestion.averageMinor === null) {
        return <span className="text-content-subtle">{t('table.noValue')}</span>;
    }
    return (
        <span className="flex flex-col">
            <WholeAmount minor={suggestion.averageMinor} />
            {averageMonths < MIN_AVERAGE_MONTHS ? (
                <span className="text-xs text-content-subtle">{t('table.averageMonths', { count: averageMonths })}</span>
            ) : null}
        </span>
    );
}

export function CutValue({ cutMinor }: { readonly cutMinor: number }): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    if (cutMinor < MIN_VISIBLE_CUT_MINOR) {
        return <span className="text-content-subtle">{t('table.noValue')}</span>;
    }
    return <WholeAmount minor={cutMinor} prefix={MINUS_SIGN} className="font-semibold text-caution" />;
}
