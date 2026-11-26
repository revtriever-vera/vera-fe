import type { TFunction } from 'i18next';
import { formatMonthYear } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { ReturnBarRow } from '../components/return-bars';
import {
    BENCHMARK_NAMES,
    CLASS_REASONS,
    type Benchmark,
    type BenchmarkName,
    type ClassReason,
    type ClassReturn,
    type MonthlyReview
} from '../types';

type ReviewT = TFunction<'portfolioReview'>;

function isClassReason(reason: string): reason is ClassReason {
    return (CLASS_REASONS as readonly string[]).includes(reason);
}

function benchmarkNote(t: ReviewT, benchmark: Benchmark, month: string, locale: SupportedLocale): string | undefined {
    if (benchmark.state !== 'ok') {
        return t(`benchmarks.${benchmark.state}`);
    }
    if (benchmark.referenceMonth === null || benchmark.referenceMonth === month) {
        return undefined;
    }
    return t('benchmarks.reference', { month: formatMonthYear(benchmark.referenceMonth, locale) });
}

export function benchmarkRows(t: ReviewT, review: MonthlyReview, locale: SupportedLocale, muted: boolean): readonly ReturnBarRow[] {
    return BENCHMARK_NAMES.map((name: BenchmarkName): ReturnBarRow => {
        const benchmark: Benchmark = review.benchmarks[name];
        return {
            key: name,
            label: t(`benchmarks.${name}`),
            pct: benchmark.state === 'ok' ? benchmark.returnPct : null,
            note: benchmarkNote(t, benchmark, review.month, locale),
            muted
        };
    });
}

export function portfolioRows(t: ReviewT, review: MonthlyReview, locale: SupportedLocale): readonly ReturnBarRow[] {
    const own: readonly ReturnBarRow[] =
        review.returnPct === undefined ? [] : [{ key: 'portfolio', label: t('returns.portfolio'), pct: review.returnPct }];
    return [...own, ...benchmarkRows(t, review, locale, false)];
}

export function classReasonText(t: ReviewT, reason: ClassReturn['reason']): string {
    return reason !== undefined && isClassReason(reason) ? t(`classReasons.${reason}`) : t('returns.unavailable');
}
