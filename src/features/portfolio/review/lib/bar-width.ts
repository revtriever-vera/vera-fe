const FULL_WIDTH: number = 100;
const MIN_WIDTH: number = 2;

export function maxMagnitude(values: readonly (number | null)[]): number {
    return Math.max(0, ...values.map((value: number | null): number => (value === null ? 0 : Math.abs(value))));
}

export function barWidth(pct: number, max: number): string {
    if (max <= 0) {
        return `${String(MIN_WIDTH)}%`;
    }
    return `${Math.max(MIN_WIDTH, (Math.abs(pct) / max) * FULL_WIDTH).toFixed(1)}%`;
}
