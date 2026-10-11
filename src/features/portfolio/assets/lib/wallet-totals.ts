import type { HoldingView } from '../../types';

export interface WalletTotals {
    readonly count: number;
    readonly totalMinor: number;
}

export function hasValue(holding: HoldingView): boolean {
    return !holding.missingQuote && !holding.missingRate;
}

export function walletTotals(holdings: readonly HoldingView[]): WalletTotals {
    return {
        count: holdings.length,
        totalMinor: holdings.reduce((sum: number, holding: HoldingView): number => sum + (hasValue(holding) ? holding.valueMinor : 0), 0)
    };
}
