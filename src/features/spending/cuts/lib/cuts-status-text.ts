import type { CutsResponse } from '../../types';

export type CutsStatusTextKey = 'status.cutSuggested' | 'status.exceedsFlexible' | 'status.goalMet' | 'status.noIncome';

export type CutsStatusLabelKey = 'status.gapLabel' | 'status.metLabel';

export interface CutsStatusView {
    readonly labelKey: CutsStatusLabelKey | null;
    readonly textKey: CutsStatusTextKey;
    readonly amountMinor: number | null;
    readonly tone: 'caution' | 'positive' | null;
    readonly count: number;
}

export function cutsStatusView(cuts: CutsResponse): CutsStatusView | null {
    switch (cuts.status) {
        case 'no_data':
            return null;
        case 'no_income':
            return { labelKey: null, textKey: 'status.noIncome', amountMinor: null, tone: null, count: 0 };
        case 'goal_met':
            return { labelKey: 'status.metLabel', textKey: 'status.goalMet', amountMinor: cuts.surplusMinor, tone: 'positive', count: 0 };
        case 'exceeds_flexible':
            return {
                labelKey: 'status.gapLabel',
                textKey: 'status.exceedsFlexible',
                amountMinor: cuts.gapMinor,
                tone: 'caution',
                count: 0
            };
        case 'cut_suggested':
            return {
                labelKey: 'status.gapLabel',
                textKey: 'status.cutSuggested',
                amountMinor: cuts.gapMinor,
                tone: 'caution',
                count: cuts.categoriesWithCut
            };
    }
}
