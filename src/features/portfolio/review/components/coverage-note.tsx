import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatMonthYear } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { nextMonth } from '../lib/next-month';
import { COVERAGE_REASON, type MonthlyReview } from '../types';

const LINK_CLASS: string = 'text-sm font-semibold text-accent-strong underline underline-offset-2';

function ImportLink(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    return (
        <Link to="/portfolio/assets" className={LINK_CLASS}>
            {t('returns.importLink')}
        </Link>
    );
}

export function CoverageNote({ review }: { readonly review: MonthlyReview }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const locale: SupportedLocale = useLocale();
    const reason: MonthlyReview['coverage']['reason'] = review.coverage.reason;
    if (reason === null) {
        return null;
    }
    if (reason === COVERAGE_REASON.noOperations) {
        return (
            <div className="flex flex-col items-start gap-1">
                <p className="text-sm text-content-muted">{t('returns.noOperations')}</p>
                <ImportLink />
            </div>
        );
    }
    if (reason === COVERAGE_REASON.noPreviousSnapshot) {
        return (
            <p className="text-sm text-content-muted">
                {t('returns.noPreviousSnapshot', { month: formatMonthYear(nextMonth(review.month), locale) })}
            </p>
        );
    }
    return (
        <p className="text-sm text-content-muted">
            {reason === COVERAGE_REASON.noBase ? t('returns.noBase') : t('returns.classesNotClosing')}
        </p>
    );
}
