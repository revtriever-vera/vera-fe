import type { AgendaItem } from '../types';

export interface AgendaWeek {
    readonly start: string;
    readonly items: readonly AgendaItem[];
}

const MONDAY_INDEX: number = 1;
const DAYS_IN_WEEK: number = 7;

export function weekStartOf(iso: string): string {
    const [year, month, day]: number[] = iso.slice(0, 10).split('-').map(Number);
    const date: Date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
    const back: number = (date.getUTCDay() + DAYS_IN_WEEK - MONDAY_INDEX) % DAYS_IN_WEEK;
    date.setUTCDate(date.getUTCDate() - back);
    return date.toISOString().slice(0, 10);
}

export function groupByWeek(items: readonly AgendaItem[]): readonly AgendaWeek[] {
    const weeks: Map<string, AgendaItem[]> = new Map<string, AgendaItem[]>();
    for (const item of items) {
        const start: string = weekStartOf(item.date);
        weeks.set(start, [...(weeks.get(start) ?? []), item]);
    }
    return [...weeks.entries()].map(([start, list]: [string, AgendaItem[]]): AgendaWeek => ({ start, items: list }));
}
