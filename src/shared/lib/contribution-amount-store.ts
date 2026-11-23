const KEY_PREFIX: string = 'vera.contribution-amount';
const RADIX: number = 10;

function keyOf(companyId: string): string {
    return `${KEY_PREFIX}.${companyId}`;
}

export function readContributionMinor(companyId: string): number | undefined {
    try {
        const raw: string | null = window.sessionStorage.getItem(keyOf(companyId));
        const value: number = raw === null ? Number.NaN : Number.parseInt(raw, RADIX);
        return Number.isSafeInteger(value) && value > 0 ? value : undefined;
    } catch {
        return undefined;
    }
}

export function writeContributionMinor(companyId: string, minor: number): void {
    try {
        window.sessionStorage.setItem(keyOf(companyId), String(minor));
    } catch {
        return;
    }
}
