import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useRecurringCalendar } from '../api/use-recurring.query';
import { sortByDate } from '../lib/calendar-groups';
import { CALENDAR_DAYS, type CalendarEntry } from '../types';
import { CalendarList } from './calendar-list';
import { CalendarMonth } from './calendar-month';

type CalendarView = 'list' | 'month';

export interface CalendarSectionProps {
    readonly onOpenSeries: (seriesId: string) => void;
}

function CalendarBody({
    query,
    view,
    onOpenSeries
}: {
    readonly query: UseQueryResult<readonly CalendarEntry[]>;
    readonly view: CalendarView;
    readonly onOpenSeries: (seriesId: string) => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    if (query.data === undefined) {
        return query.error === null ? (
            <Loading label={t('calendar.loading')}>
                <Skeleton className="h-32 w-full" />
            </Loading>
        ) : (
            <div className="flex flex-col items-start gap-3">
                <FailureAlert error={query.error} title={t('calendar.loadError')} />
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
    if (query.data.length === 0) {
        return <p className="text-sm text-content-muted">{t('calendar.empty')}</p>;
    }
    const entries: readonly CalendarEntry[] = sortByDate(query.data);
    return view === 'list' ? (
        <CalendarList entries={entries} onOpenSeries={onOpenSeries} />
    ) : (
        <CalendarMonth entries={entries} onOpenSeries={onOpenSeries} />
    );
}

export function CalendarSection({ onOpenSeries }: CalendarSectionProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const query: UseQueryResult<readonly CalendarEntry[]> = useRecurringCalendar(CALENDAR_DAYS);
    const [view, setView] = useState<CalendarView>('list');
    const options: readonly SegmentedOption<CalendarView>[] = [
        { value: 'list', label: t('calendar.list') },
        { value: 'month', label: t('calendar.month') }
    ];
    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold">{t('calendar.title')}</h3>
                    <p className="text-sm text-content-muted">{t('calendar.description')}</p>
                </div>
                <SegmentedControl label={t('calendar.viewLabel')} options={options} value={view} onChange={setView} />
            </div>
            <CalendarBody query={query} view={view} onOpenSeries={onOpenSeries} />
        </section>
    );
}
