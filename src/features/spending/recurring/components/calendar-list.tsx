import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { ResponsiveRows } from '@/shared/ui/responsive-rows';
import type { TableColumn } from '@/shared/ui/table';
import { groupByWeek, type WeekGroup } from '../lib/calendar-groups';
import { calendarAccountText, calendarAmountText } from '../lib/calendar-text';
import { shortDate, weekdayShortDate } from '../lib/recurring-dates';
import { RECURRING_CURRENCY, type CalendarEntry } from '../types';

export interface CalendarListProps {
    readonly entries: readonly CalendarEntry[];
    readonly onOpenSeries: (seriesId: string) => void;
}

const MIN_WIDTH: string = 'min-w-[36rem]';

function useColumns(): readonly TableColumn<CalendarEntry>[] {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    return [
        { key: 'date', header: t('calendar.date'), render: (row): string => weekdayShortDate(row.date, locale) },
        {
            key: 'name',
            header: t('calendar.name'),
            render: (row): ReactElement => (
                <div className="flex flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="break-words font-medium">{row.name}</span>
                        {row.isSuggestion ? <Badge>{t('calendar.suggestion')}</Badge> : null}
                    </span>
                    {row.state === 'missed' ? (
                        <span className="text-xs text-caution">{t('calendar.missed', { date: shortDate(row.date, locale) })}</span>
                    ) : null}
                </div>
            )
        },
        { key: 'account', header: t('calendar.account'), render: (row): string => calendarAccountText(row, t) },
        {
            key: 'amount',
            header: t('calendar.amount'),
            align: 'right',
            render: (row): string =>
                calendarAmountText(
                    row.amountMinor,
                    row.isEstimate,
                    (amount: number): string => formatCurrency(amount, RECURRING_CURRENCY, locale),
                    t
                )
        }
    ];
}

function WeekTable({ week, onOpenSeries }: { readonly week: WeekGroup; readonly onOpenSeries: (seriesId: string) => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    const columns: readonly TableColumn<CalendarEntry>[] = useColumns();
    const range: { readonly from: string; readonly to: string } = { from: shortDate(week.start, locale), to: shortDate(week.end, locale) };
    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-content-muted">{t('calendar.weekTitle', range)}</h4>
            <ResponsiveRows
                label={t('calendar.tableLabel', range)}
                columns={columns}
                rows={week.entries}
                rowKey={(row): string => `${row.seriesId}:${row.date}`}
                minWidthClass={MIN_WIDTH}
                onRowActivate={(row): void => {
                    onOpenSeries(row.seriesId);
                }}
            />
        </div>
    );
}

export function CalendarList({ entries, onOpenSeries }: CalendarListProps): ReactElement {
    return (
        <div className="flex flex-col gap-4">
            {groupByWeek(entries).map((week: WeekGroup): ReactElement => (
                <WeekTable key={week.start} week={week} onOpenSeries={onOpenSeries} />
            ))}
        </div>
    );
}
