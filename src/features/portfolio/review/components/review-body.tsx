import type { ComponentType, ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useMonthlyReview } from '../api/use-monthly-review.query';
import type { MonthlyReview } from '../types';
import { ConcentrationSection } from './concentration-section';
import { IncomeSection } from './income-section';
import { MovesSection } from './moves-section';
import { ReturnsSection } from './returns-section';

const NOT_FOUND: number = 404;

export interface NarrativeProps {
    readonly month: string;
    readonly text: string | null;
}

export interface ReviewBodyProps {
    readonly month: string;
    readonly Narrative: ComponentType<NarrativeProps>;
}

function ReviewLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    return (
        <Loading label={t('loading')} className="flex flex-col gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </Loading>
    );
}

function ReviewFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    if (error instanceof ApiError && error.status === NOT_FOUND) {
        return <p className="text-sm text-content-muted">{t('empty.missing')}</p>;
    }
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('retry')}
            </Button>
        </div>
    );
}

function ReviewSections({ review, Narrative }: { readonly review: MonthlyReview } & Pick<ReviewBodyProps, 'Narrative'>): ReactElement {
    return (
        <div className="flex flex-col gap-4">
            <Narrative month={review.month} text={review.summary ?? null} />
            <ReturnsSection review={review} />
            <MovesSection review={review} />
            <IncomeSection review={review} />
            <ConcentrationSection review={review} />
        </div>
    );
}

export function ReviewBody({ month, Narrative }: ReviewBodyProps): ReactElement {
    const query: ReturnType<typeof useMonthlyReview> = useMonthlyReview(month);
    if (query.data === undefined) {
        return query.error === null ? (
            <ReviewLoading />
        ) : (
            <ReviewFailure
                error={query.error}
                onRetry={(): void => {
                    void query.refetch();
                }}
            />
        );
    }
    return <ReviewSections review={query.data} Narrative={Narrative} />;
}
