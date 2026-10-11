import type { SummaryCategoryRow } from '../../types';

export const HIGHLIGHT_DELTA_BPS: number = 1000;

export function shouldHighlight(row: Pick<SummaryCategoryRow, 'deltaBps'>): boolean {
    return row.deltaBps !== null && row.deltaBps >= HIGHLIGHT_DELTA_BPS;
}
