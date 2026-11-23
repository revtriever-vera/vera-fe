import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useTransactions } from '../../transactions/api/use-transactions.query';
import type { TransactionsResponse } from '../../types';
import { useRecurring } from '../api/use-recurring.query';
import { AlertsStrip } from '../components/alerts-strip';
import { CalendarSection } from '../components/calendar-section';
import { ConfirmedSection } from '../components/confirmed-section';
import { InactiveSection } from '../components/inactive-section';
import { RecurringNoSeries, RecurringNoTransactions } from '../components/recurring-empty';
import { RecurringKpis } from '../components/recurring-kpis';
import { ReviewSection } from '../components/review-section';
import { SeriesDetailDialog } from '../components/series-detail-dialog';
import type { RecurringOverview, RecurringSeriesView } from '../types';

function RecurringLoading(): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <Loading label={t('loading')} className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
        </Loading>
    );
}

function RecurringFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('retry')}
            </Button>
        </div>
    );
}

function allSeries(overview: RecurringOverview): readonly RecurringSeriesView[] {
    return [...overview.review, ...overview.confirmed, ...overview.stopped, ...overview.dismissed];
}

function RecurringContent({ overview }: { readonly overview: RecurringOverview }): ReactElement {
    const [openId, setOpenId] = useState<string | null>(null);
    const everything: readonly RecurringSeriesView[] = allSeries(overview);
    const open: RecurringSeriesView | undefined = everything.find((item: RecurringSeriesView): boolean => item.id === openId);
    return (
        <div className="flex flex-col gap-6">
            <RecurringKpis totals={overview.totals} />
            <AlertsStrip alerts={overview.alerts} series={everything} onOpenSeries={setOpenId} />
            <ReviewSection series={overview.review} />
            <CalendarSection onOpenSeries={setOpenId} />
            <ConfirmedSection series={overview.confirmed} onOpenSeries={setOpenId} />
            <InactiveSection stopped={overview.stopped} dismissed={overview.dismissed} />
            {open === undefined ? null : (
                <SeriesDetailDialog
                    series={open}
                    onClose={(): void => {
                        setOpenId(null);
                    }}
                />
            )}
        </div>
    );
}

function isEmpty(overview: RecurringOverview): boolean {
    return overview.review.length + overview.confirmed.length + overview.stopped.length + overview.dismissed.length === 0;
}

function RecurringEmpty(): ReactElement {
    const transactions: UseQueryResult<TransactionsResponse> = useTransactions({ pageSize: 1 });
    if (transactions.data === undefined) {
        return <RecurringLoading />;
    }
    return transactions.data.pagination.totalRecords === 0 ? <RecurringNoTransactions /> : <RecurringNoSeries />;
}

function RecurringBody(): ReactElement {
    const overview: UseQueryResult<RecurringOverview> = useRecurring();
    if (overview.data !== undefined) {
        return isEmpty(overview.data) ? <RecurringEmpty /> : <RecurringContent overview={overview.data} />;
    }
    if (overview.error !== null) {
        return (
            <RecurringFailure
                error={overview.error}
                onRetry={(): void => {
                    void overview.refetch();
                }}
            />
        );
    }
    return <RecurringLoading />;
}

export function RecurringPage(): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <section className="flex flex-col gap-4">
            <div>
                <h2 className="text-xl font-extrabold">{t('title')}</h2>
                <p className="text-sm text-content-muted">{t('subtitle')}</p>
            </div>
            <RecurringBody />
        </section>
    );
}
