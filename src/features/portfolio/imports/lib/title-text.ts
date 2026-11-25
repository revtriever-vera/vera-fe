import type { TFunction } from 'i18next';
import type { SupportedLocale } from '@/shared/lib/locale';
import { bpsToInput } from '../../lib/parse-percent-input';
import type { ImportedTitle } from '../schemas/imported-title.schema';

type ReasonKey =
    | 'fixedIncome.reasons.missing_data'
    | 'fixedIncome.reasons.implausible'
    | 'fixedIncome.reasons.missing_series'
    | 'fixedIncome.reasons.event'
    | 'fixedIncome.reasons.grace'
    | 'fixedIncome.reasons.issue_date'
    | 'fixedIncome.reasons.generic';

const REASON_KEYS: Readonly<Record<string, ReasonKey>> = {
    missing_data: 'fixedIncome.reasons.missing_data',
    implausible: 'fixedIncome.reasons.implausible',
    missing_series: 'fixedIncome.reasons.missing_series',
    event: 'fixedIncome.reasons.event',
    grace: 'fixedIncome.reasons.grace',
    issue_date: 'fixedIncome.reasons.issue_date'
};

const MONTH_YEAR_PARTS: RegExp = /^(\d{4})-(\d{2})/;

export function formatMonthYear(iso: string, locale: SupportedLocale): string {
    const match: RegExpMatchArray | null = MONTH_YEAR_PARTS.exec(iso);
    if (match?.[1] === undefined || match[2] === undefined) {
        return iso;
    }
    const date: Date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
    return new Intl.DateTimeFormat(locale, { month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function titleRateText(t: TFunction<'portfolioImports'>, title: ImportedTitle, locale: SupportedLocale): string {
    if (title.rateBps === null || title.indexer === null) {
        return t('fixedIncome.unknownRate');
    }
    return t(`fixedIncome.rates.${title.indexer}`, { rate: `${bpsToInput(title.rateBps, locale)}%` });
}

export function titleMaturityText(t: TFunction<'portfolioImports'>, title: ImportedTitle, locale: SupportedLocale): string {
    return title.maturityDate === null ? t('fixedIncome.unknownMaturity') : formatMonthYear(title.maturityDate, locale);
}

export function titleReasonText(t: TFunction<'portfolioImports'>, reason: string | null): string {
    return t(REASON_KEYS[reason ?? ''] ?? 'fixedIncome.reasons.generic');
}
