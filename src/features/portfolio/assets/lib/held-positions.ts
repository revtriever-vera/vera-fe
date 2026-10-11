import type { HoldingView } from '../../types';

export function heldPositions(holdings: readonly HoldingView[]): ReadonlyMap<string, string> {
    const held: Map<string, string> = new Map<string, string>();
    for (const holding of holdings) {
        if (holding.kind === 'position' && holding.assetId !== null) {
            held.set(holding.assetId, holding.id);
        }
    }
    return held;
}

export function countByType(holdings: readonly HoldingView[], type: string): number {
    return holdings.filter((holding: HoldingView): boolean => holding.typeGroup === type).length;
}
