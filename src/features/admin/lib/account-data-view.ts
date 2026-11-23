export const MAX_ROWS: number = 50;
export const MAX_COLUMNS: number = 8;

export interface ScalarLabels {
    readonly yes: string;
    readonly no: string;
    readonly empty: string;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function recordRows(value: unknown): readonly Record<string, unknown>[] | null {
    if (!Array.isArray(value) || value.length === 0) {
        return null;
    }
    return value.every(isRecord) ? value : null;
}

export function columnsOf(rows: readonly Record<string, unknown>[]): readonly string[] {
    const keys: Set<string> = new Set<string>();
    for (const row of rows) {
        Object.keys(row).forEach((key: string): void => {
            keys.add(key);
        });
    }
    return [...keys].slice(0, MAX_COLUMNS);
}

export function humanizeKey(key: string): string {
    const spaced: string = key
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .toLowerCase();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function scalarText(value: unknown, labels: ScalarLabels): string {
    if (value === null || value === undefined || value === '') {
        return labels.empty;
    }
    if (typeof value === 'boolean') {
        return value ? labels.yes : labels.no;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
        return String(value);
    }
    return JSON.stringify(value);
}
