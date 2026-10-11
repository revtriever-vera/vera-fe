import type { HoldingView } from '../../types';

export type HoldingFlag = 'missing_quote' | 'stale' | 'estimated' | 'matured' | 'missing_rate';

type FlagField = 'missingQuote' | 'stale' | 'estimated' | 'matured' | 'missingRate';

const FLAG_FIELDS: readonly (readonly [HoldingFlag, FlagField])[] = [
    ['missing_quote', 'missingQuote'],
    ['stale', 'stale'],
    ['estimated', 'estimated'],
    ['matured', 'matured'],
    ['missing_rate', 'missingRate']
];

export function holdingFlags(holding: HoldingView): readonly HoldingFlag[] {
    return FLAG_FIELDS.filter(([, field]: readonly [HoldingFlag, FlagField]): boolean => holding[field]).map(
        ([flag]: readonly [HoldingFlag, FlagField]): HoldingFlag => flag
    );
}

export function hasUnreliableValue(holding: HoldingView): boolean {
    return holding.missingQuote || holding.missingRate;
}
