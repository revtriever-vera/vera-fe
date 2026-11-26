const MONTHS_IN_YEAR: number = 12;
const RADIX: number = 10;
const MONTH_PARTS: RegExp = /^(\d{4})-(\d{2})$/;

export function nextMonth(month: string): string {
    const match: RegExpMatchArray | null = MONTH_PARTS.exec(month);
    if (match === null) {
        return month;
    }
    const year: number = Number.parseInt(match[1] ?? '0', RADIX);
    const index: number = Number.parseInt(match[2] ?? '1', RADIX);
    const rolled: boolean = index === MONTHS_IN_YEAR;
    const nextYear: number = rolled ? year + 1 : year;
    const nextIndex: number = rolled ? 1 : index + 1;
    return `${String(nextYear)}-${String(nextIndex).padStart(2, '0')}`;
}
