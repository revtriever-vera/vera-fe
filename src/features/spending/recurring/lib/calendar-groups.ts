import type { CalendarEntry } from '../types';
import { addDays, daysInMonth, mondayFirstWeekday, mondayOf, monthOf } from './recurring-dates';

export interface WeekGroup {
    readonly start: string;
    readonly end: string;
    readonly entries: readonly CalendarEntry[];
}

export interface MonthDay {
    readonly iso: string;
    readonly day: number;
    readonly entries: readonly CalendarEntry[];
}

export interface MonthGrid {
    readonly month: string;
    readonly leading: number;
    readonly days: readonly MonthDay[];
}

const WEEK_LAST_DAY: number = 6;

export function sortByDate(entries: readonly CalendarEntry[]): readonly CalendarEntry[] {
    return [...entries].sort((left: CalendarEntry, right: CalendarEntry): number => left.date.localeCompare(right.date));
}

export function groupByWeek(entries: readonly CalendarEntry[]): readonly WeekGroup[] {
    const byStart: Map<string, CalendarEntry[]> = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
        const start: string = mondayOf(entry.date);
        byStart.set(start, [...(byStart.get(start) ?? []), entry]);
    }
    return Array.from(byStart.entries())
        .sort(([left]: [string, CalendarEntry[]], [right]: [string, CalendarEntry[]]): number => left.localeCompare(right))
        .map(([start, group]: [string, CalendarEntry[]]): WeekGroup => ({ start, end: addDays(start, WEEK_LAST_DAY), entries: group }));
}

function monthsBetween(first: string, last: string): readonly string[] {
    const months: string[] = [];
    let cursor: string = monthOf(first);
    while (cursor <= monthOf(last)) {
        months.push(cursor);
        cursor = monthOf(addDays(`${cursor}-${String(daysInMonth(cursor)).padStart(2, '0')}`, 1));
    }
    return months;
}

function gridOf(month: string, entries: readonly CalendarEntry[]): MonthGrid {
    const days: MonthDay[] = Array.from({ length: daysInMonth(month) }, (_unused: unknown, index: number): MonthDay => {
        const day: number = index + 1;
        const iso: string = `${month}-${String(day).padStart(2, '0')}`;
        return { iso, day, entries: entries.filter((entry: CalendarEntry): boolean => entry.date === iso) };
    });
    return { month, leading: mondayFirstWeekday(`${month}-01`), days };
}

export function monthGrids(entries: readonly CalendarEntry[]): readonly MonthGrid[] {
    const first: CalendarEntry | undefined = entries[0];
    const last: CalendarEntry | undefined = entries.at(-1);
    if (first === undefined || last === undefined) {
        return [];
    }
    return monthsBetween(first.date, last.date).map((month: string): MonthGrid => gridOf(month, entries));
}
