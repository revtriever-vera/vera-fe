import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { formatMonthName } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { monthGrids, type MonthDay, type MonthGrid } from '../lib/calendar-groups';
import { calendarAmountText } from '../lib/calendar-text';
import { shortDate, weekdayLabels } from '../lib/recurring-dates';
import { RECURRING_CURRENCY, type CalendarEntry } from '../types';
import { cn } from '@/shared/lib/cn';

export interface CalendarMonthProps {
    readonly entries: readonly CalendarEntry[];
    readonly onOpenSeries: (seriesId: string) => void;
}

function EntryButton({
    entry,
    onOpenSeries
}: {
    readonly entry: CalendarEntry;
    readonly onOpenSeries: (seriesId: string) => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    const amount: string = calendarAmountText(
        entry.amountMinor,
        entry.isEstimate,
        (value: number): string => formatCurrency(value, RECURRING_CURRENCY, locale),
        t
    );
    return (
        <button
            type="button"
            aria-label={t('calendar.openLabel', { name: entry.name, date: shortDate(entry.date, locale) })}
            onClick={(): void => {
                onOpenSeries(entry.seriesId);
            }}
            className={cn(
                'flex w-full flex-col rounded-control px-1.5 py-1 text-left text-2xs transition hover:bg-surface-muted',
                entry.state === 'missed' ? 'bg-caution/10 text-caution' : 'bg-accent/10 text-content'
            )}
        >
            <span className="break-words font-semibold">{entry.name}</span>
            <span className="numeric">{amount}</span>
        </button>
    );
}

function DayCell({ day, onOpenSeries }: { readonly day: MonthDay; readonly onOpenSeries: (seriesId: string) => void }): ReactElement {
    return (
        <td className="h-20 min-w-24 border border-border/60 p-1 align-top">
            <div className="flex flex-col gap-1">
                <span className="numeric text-2xs text-content-subtle">{day.day}</span>
                {day.entries.map((entry: CalendarEntry): ReactElement => (
                    <EntryButton key={`${entry.seriesId}:${entry.date}`} entry={entry} onOpenSeries={onOpenSeries} />
                ))}
            </div>
        </td>
    );
}

const weekdayCount: number = 7;

interface MonthCell {
    readonly key: string;
    readonly day: MonthDay | null;
}

function weeksOf(grid: MonthGrid): readonly (readonly MonthCell[])[] {
    const cells: MonthCell[] = [];
    for (let index: number = 0; index < grid.leading; index += 1) {
        cells.push({ key: `lead-${grid.month}-${String(index)}`, day: null });
    }
    cells.push(...grid.days.map((day: MonthDay): MonthCell => ({ key: day.iso, day })));
    const tail: number = (weekdayCount - (cells.length % weekdayCount)) % weekdayCount;
    for (let index: number = 0; index < tail; index += 1) {
        cells.push({ key: `tail-${grid.month}-${String(index)}`, day: null });
    }
    const rows: MonthCell[][] = [];
    for (let start: number = 0; start < cells.length; start += weekdayCount) {
        rows.push(cells.slice(start, start + weekdayCount));
    }
    return rows;
}

function MonthTable({ grid, onOpenSeries }: { readonly grid: MonthGrid; readonly onOpenSeries: (seriesId: string) => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    const month: string = formatMonthName(grid.month, locale);
    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold capitalize text-content-muted">{month}</h4>
            <div className="overflow-x-auto">
                <table aria-label={t('calendar.monthTable', { month })} className="w-full min-w-[42rem] table-fixed border-collapse">
                    <thead>
                        <tr>
                            {weekdayLabels(locale).map((label: string): ReactElement => (
                                <th
                                    key={label}
                                    scope="col"
                                    className="px-1 py-1 text-left text-2xs font-semibold capitalize text-content-subtle"
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeksOf(grid).map((week: readonly MonthCell[]): ReactElement => (
                            <tr key={week[0]?.key}>
                                {week.map((cell: MonthCell): ReactElement =>
                                    cell.day === null ? (
                                        <td key={cell.key} className="border border-border/60 bg-surface-muted/40" />
                                    ) : (
                                        <DayCell key={cell.key} day={cell.day} onOpenSeries={onOpenSeries} />
                                    )
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function CalendarMonth({ entries, onOpenSeries }: CalendarMonthProps): ReactElement {
    return (
        <div className="flex flex-col gap-6">
            {monthGrids(entries).map((grid: MonthGrid): ReactElement => (
                <MonthTable key={grid.month} grid={grid} onOpenSeries={onOpenSeries} />
            ))}
        </div>
    );
}
