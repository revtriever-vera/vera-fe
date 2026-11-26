import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { benchmarkRows, portfolioRows } from '../lib/return-rows';
import { COVERAGE_REASON, type MonthlyReview } from '../types';
import { ClassReturns } from './class-returns';
import { CoverageNote } from './coverage-note';
import { ReturnBars } from './return-bars';

export function ReturnsSection({ review }: { readonly review: MonthlyReview }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const locale: SupportedLocale = useLocale();
    const noOperations: boolean = review.coverage.reason === COVERAGE_REASON.noOperations;
    return (
        <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-2">
                <h3 className="text-base font-semibold">{t('returns.title')}</h3>
                <CoverageNote review={review} />
                <ReturnBars rows={portfolioRows(t, review, locale)} />
                {noOperations ? null : <p className="text-xs text-content-muted">{t('returns.method')}</p>}
            </Card>
            {noOperations || review.byClass.length === 0 ? null : (
                <ClassReturns review={review} benchmarks={benchmarkRows(t, review, locale, true)} />
            )}
        </div>
    );
}
