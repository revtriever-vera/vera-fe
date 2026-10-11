const DAYS_PER_YEAR: number = 365.25;
const MS_PER_DAY: number = 86400000;
const BPS: number = 10000;
const MIN_YEARS_TO_ANNUALIZE: number = 1 / 12;

export function yearsBetween(fromIso: string, toIso: string): number {
    const from: number = Date.parse(`${fromIso.slice(0, 10)}T00:00:00Z`);
    const to: number = Date.parse(`${toIso.slice(0, 10)}T00:00:00Z`);
    return Math.max(to - from, 0) / MS_PER_DAY / DAYS_PER_YEAR;
}

export function annualizedBps(accruedBps: number, years: number): number | null {
    if (years < MIN_YEARS_TO_ANNUALIZE) {
        return null;
    }
    return Math.round((Math.pow(1 + accruedBps / BPS, 1 / years) - 1) * BPS);
}

export function roundYears(years: number): number {
    return Math.round(years * 10) / 10;
}
