import type { TFunction } from 'i18next';
import { formatClock, formatDayMonthNumeric, formatMonthName, isSameLocalDay } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';
import { SUMMARY_KIND, type SummaryKind } from '../types';

export function summaryTitle(t: TFunction<'summaries'>, kind: SummaryKind, month: string | undefined, locale: SupportedLocale): string {
    if (kind === SUMMARY_KIND.month) {
        return t('card.titleMonth', { month: formatMonthName(month ?? '', locale) });
    }
    return kind === SUMMARY_KIND.cuts ? t('card.titleCuts') : t('card.titlePortfolio');
}

export function summaryDescription(t: TFunction<'summaries'>, kind: SummaryKind): string {
    if (kind === SUMMARY_KIND.month) {
        return t('card.descriptionMonth');
    }
    return kind === SUMMARY_KIND.cuts ? t('card.descriptionCuts') : t('card.descriptionPortfolio');
}

export function summaryMeta(t: TFunction<'summaries'>, kind: SummaryKind, stale: boolean, when: string): string {
    if (stale) {
        return t('meta.stale', { when });
    }
    if (kind === SUMMARY_KIND.month) {
        return t('meta.month', { when });
    }
    return kind === SUMMARY_KIND.cuts ? t('meta.cuts', { when }) : t('meta.portfolio', { when });
}

export function summaryWhen(t: TFunction<'summaries'>, generatedAt: string, now: Date, locale: SupportedLocale): string {
    const moment: Date = new Date(generatedAt);
    const time: string = formatClock(moment, locale);
    return isSameLocalDay(moment, now)
        ? t('meta.today', { time })
        : t('meta.otherDay', { date: formatDayMonthNumeric(moment, locale), time });
}
