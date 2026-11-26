import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useMonthlyReviews } from '../api/use-monthly-reviews.query';
import { MonthSelect } from '../components/month-select';
import { ReviewBody, type ReviewBodyProps } from '../components/review-body';
import { selectedMonth, useMonthParam } from '../lib/selected-month';
import type { MonthlyReviewList } from '../types';

export type ReviewPageProps = Pick<ReviewBodyProps, 'Narrative'>;

function ReviewHeader({ children }: { readonly children?: ReactElement }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 className="text-xl font-extrabold">{t('title')}</h2>
                <p className="text-sm text-content-muted">{t('subtitle')}</p>
            </div>
            {children}
        </div>
    );
}

function ReviewListState({ query }: { readonly query: ReturnType<typeof useMonthlyReviews> }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    if (query.error !== null) {
        return (
            <div className="flex flex-col items-start gap-3">
                <FailureAlert error={query.error} title={t('loadError')} />
                <Button
                    variant="secondary"
                    onClick={(): void => {
                        void query.refetch();
                    }}
                >
                    {t('retry')}
                </Button>
            </div>
        );
    }
    return (
        <Loading label={t('loading')} className="flex flex-col gap-4">
            <Skeleton className="h-40 w-full" />
        </Loading>
    );
}

function ReviewLoaded({ items, Narrative }: { readonly items: MonthlyReviewList['items'] } & ReviewPageProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const month: string | undefined = selectedMonth(items, useMonthParam());
    if (month === undefined) {
        return (
            <>
                <ReviewHeader />
                <EmptyState title={t('empty.title')} description={t('empty.description')} />
            </>
        );
    }
    return (
        <>
            <ReviewHeader>
                <MonthSelect items={items} value={month} />
            </ReviewHeader>
            <ReviewBody month={month} Narrative={Narrative} />
        </>
    );
}

export function ReviewPage({ Narrative }: ReviewPageProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const list: ReturnType<typeof useMonthlyReviews> = useMonthlyReviews();
    return (
        <section className="flex flex-col gap-4">
            {list.data === undefined ? (
                <>
                    <ReviewHeader />
                    <ReviewListState query={list} />
                </>
            ) : (
                <ReviewLoaded items={list.data.items} Narrative={Narrative} />
            )}
            <p className="text-xs text-content-muted">{t('notice')}</p>
        </section>
    );
}
