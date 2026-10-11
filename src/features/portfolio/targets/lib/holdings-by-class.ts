import type { HoldingView } from '../../types';

export function holdingsByClass(holdings: readonly HoldingView[]): ReadonlyMap<string, number> {
    return holdings.reduce(
        (counts: Map<string, number>, holding: HoldingView): Map<string, number> =>
            counts.set(holding.classId, (counts.get(holding.classId) ?? 0) + 1),
        new Map<string, number>()
    );
}
