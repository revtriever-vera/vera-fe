import type { TFunction } from 'i18next';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { ImportPreview, ImportRejection, ImportRejectionReason, ImportView } from '../../types';

const MAX_LINES_PER_GROUP: number = 5;

export interface ResultCounts {
    readonly inserted: string;
    readonly duplicates: string;
    readonly rejected: string;
}

export function formatShortDay(iso: string, locale: SupportedLocale): string {
    const [year, month, day]: number[] = iso.slice(0, 10).split('-').map(Number);
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(
        new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1))
    );
}

export function formatMoment(iso: string, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(new Date(iso));
}

function periodText(t: TFunction<'spendingImports'>, preview: ImportPreview, locale: SupportedLocale): string {
    if (preview.periodStart === null || preview.periodEnd === null) {
        return t('preview.noPeriod');
    }
    return t('preview.period', { start: formatShortDay(preview.periodStart, locale), end: formatShortDay(preview.periodEnd, locale) });
}

export function previewSummaryText(t: TFunction<'spendingImports'>, preview: ImportPreview, locale: SupportedLocale): string {
    return t('preview.summary', { count: preview.rows, period: periodText(t, preview, locale) });
}

function groupByReason(rejections: readonly ImportRejection[]): Map<ImportRejectionReason, number[]> {
    const groups: Map<ImportRejectionReason, number[]> = new Map();
    for (const rejection of rejections) {
        groups.set(rejection.reason, [...(groups.get(rejection.reason) ?? []), rejection.line]);
    }
    return groups;
}

function groupText(
    t: TFunction<'spendingImports'>,
    locale: SupportedLocale,
    reason: ImportRejectionReason,
    lines: readonly number[]
): string {
    const shown: string[] = lines.slice(0, MAX_LINES_PER_GROUP).map(String);
    return t('preview.rejectionGroup', {
        count: Math.min(lines.length, MAX_LINES_PER_GROUP),
        lines: new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(shown),
        reason: t(`preview.reasons.${reason}`)
    });
}

export function rejectionsText(
    t: TFunction<'spendingImports'>,
    locale: SupportedLocale,
    rejected: number,
    rejections: readonly ImportRejection[]
): string {
    const details: string = Array.from(groupByReason(rejections).entries())
        .map(([reason, lines]: [ImportRejectionReason, number[]]): string => groupText(t, locale, reason, lines))
        .join('; ');
    return t('preview.rejected', { count: rejected, details });
}

export function resultCounts(
    t: TFunction<'spendingImports'>,
    counts: { readonly inserted: number; readonly duplicates: number; readonly rejected: number }
): ResultCounts {
    return {
        inserted: t('result.inserted', { count: counts.inserted }),
        duplicates: t('result.duplicates', { count: counts.duplicates }),
        rejected: t('result.rejected', { count: counts.rejected })
    };
}

export function historyCountsText(t: TFunction<'spendingImports'>, view: Pick<ImportView, 'inserted' | 'duplicates'>): string {
    return t('history.summary', {
        inserted: t('history.inserted', { count: view.inserted }),
        duplicates: t('history.duplicates', { count: view.duplicates })
    });
}
