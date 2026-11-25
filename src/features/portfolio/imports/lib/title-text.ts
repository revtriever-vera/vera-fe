import type { TFunction } from 'i18next';
import type { SupportedLocale } from '@/shared/lib/locale';
import { bpsToInput } from '../../lib/parse-percent-input';
import type { ImportedTitle } from '../schemas/imported-title.schema';

type ReasonKey =
    | 'fixedIncome.reasons.missing_data'
    | 'fixedIncome.reasons.implausible'
    | 'fixedIncome.reasons.missing_series'
    | 'fixedIncome.reasons.too_recent'
    | 'fixedIncome.reasons.payment_event'
    | 'fixedIncome.reasons.grace_period'
    | 'fixedIncome.reasons.application_date_differs'
    | 'fixedIncome.reasons.estimated_series'
    | 'fixedIncome.reasons.assumed_face_price'
    | 'fixedIncome.reasons.unsupported_kind'
    | 'fixedIncome.reasons.incomplete_data'
    | 'fixedIncome.reasons.duplicate'
    | 'fixedIncome.reasons.generic';

const REASON_KEYS: Readonly<Record<string, ReasonKey>> = {
    missing_data: 'fixedIncome.reasons.missing_data',
    implausible: 'fixedIncome.reasons.implausible',
    missing_series: 'fixedIncome.reasons.missing_series',
    too_recent: 'fixedIncome.reasons.too_recent',
    payment_event: 'fixedIncome.reasons.payment_event',
    grace_period: 'fixedIncome.reasons.grace_period',
    application_date_differs: 'fixedIncome.reasons.application_date_differs',
    estimated_series: 'fixedIncome.reasons.estimated_series',
    assumed_face_price: 'fixedIncome.reasons.assumed_face_price',
    unsupported_kind: 'fixedIncome.reasons.unsupported_kind',
    incomplete_data: 'fixedIncome.reasons.incomplete_data',
    duplicate: 'fixedIncome.reasons.duplicate'
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

export const ASSUMED_FACE_PRICE: string = 'assumed_face_price';

export function titleHasAssumedFacePrice(title: ImportedTitle): boolean {
    return title.reason === ASSUMED_FACE_PRICE;
}
