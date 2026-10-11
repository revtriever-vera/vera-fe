const MONTH_RADIX: number = 10;
const MONTHS_IN_YEAR: number = 12;

export interface MonthNeighbors {
    readonly previousMonth: string;
    readonly nextMonth: string | null;
    readonly isPartial: boolean;
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

export function currentMonth(now: Date = new Date()): string {
    return `${String(now.getFullYear())}-${pad(now.getMonth() + 1)}`;
}

export function shiftMonth(month: string, delta: number): string {
    const [year, number]: number[] = month.split('-').map((part: string): number => Number.parseInt(part, MONTH_RADIX));
    const index: number = (year ?? 1970) * MONTHS_IN_YEAR + ((number ?? 1) - 1) + delta;
    return `${String(Math.floor(index / MONTHS_IN_YEAR))}-${pad((index % MONTHS_IN_YEAR) + 1)}`;
}

export function monthNeighbors(month: string, now: string): MonthNeighbors {
    return {
        previousMonth: shiftMonth(month, -1),
        nextMonth: month < now ? shiftMonth(month, 1) : null,
        isPartial: month === now
    };
}
