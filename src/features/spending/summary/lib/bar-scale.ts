import type { SummaryCategoryRow } from '../../types';

const FULL_PERCENT: number = 100;

export function barScale(rows: readonly Pick<SummaryCategoryRow, 'spentMinor' | 'averageMinor'>[], uncategorizedMinor: number): number {
    return rows.reduce(
        (scale: number, row: Pick<SummaryCategoryRow, 'spentMinor' | 'averageMinor'>): number =>
            Math.max(scale, row.spentMinor, row.averageMinor ?? 0),
        Math.max(uncategorizedMinor, 0)
    );
}

export function widthPercent(valueMinor: number, scale: number): number {
    if (scale <= 0 || valueMinor <= 0) {
        return 0;
    }
    return Math.min(FULL_PERCENT, (valueMinor / scale) * FULL_PERCENT);
}
