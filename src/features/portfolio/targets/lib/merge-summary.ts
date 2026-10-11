import type { AssetClassView } from '../../types';

export interface MergeSummary {
    readonly sourceTargetBps: number;
    readonly destinationTargetBps: number;
    readonly sumBps: number;
    readonly movedCount: number;
}

export function mergeSummary(source: AssetClassView, destination: AssetClassView, sourceHoldings: number): MergeSummary {
    return {
        sourceTargetBps: source.targetBps,
        destinationTargetBps: destination.targetBps,
        sumBps: source.targetBps + destination.targetBps,
        movedCount: sourceHoldings
    };
}
